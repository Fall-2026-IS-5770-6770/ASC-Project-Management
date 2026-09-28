// Loads the dummy data in data/ into the database. Rows are inserted with their
// dummy data ids, and any id that already exists is left alone, so running it
// again only fills in what's missing.
//   npx prisma db seed
// With --if-empty (how the Docker image runs it) nothing is added to a
// database that already has people, or to MongoDB once it has messages, so
// restarting a container never brings back dummy rows someone deleted.
const fs = require("fs");
const path = require("path");

const envFile = path.join(__dirname, "..", ".env");
if (fs.existsSync(envFile)) {
    process.loadEnvFile(envFile);
}

const mongoose = require("mongoose");
const { PrismaClient } = require("../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const ONLY_IF_EMPTY = process.argv.includes("--if-empty");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Dummy data dates are YYYY-MM-DD strings; the database stores them as dates
function date(value) {
    return value ? new Date(`${value}T00:00:00Z`) : null;
}

// Dummy data times are YYYY-MM-DDTHH:MM:SS; the app treats them as UTC
function time(value) {
    return value ? new Date(`${value}Z`) : null;
}

// Link a many-to-many relation to existing rows by id
function connect(ids) {
    return { connect: (ids || []).map(id => ({ id })) };
}

// In dependency order: a table only points at tables above it. The five roles
// themselves are created by the add_roles migration.
const tables = [
    { model: "status", table: "Status", rows: require("../data/statuses.js"), map: row => row },
    { model: "mainBoardStatus", table: "MainBoardStatus", rows: require("../data/mainBoardStatuses.js"), map: row => row },
    { model: "person", table: "Person", rows: require("../data/people.js"), map: row => row },
    { model: "skill", table: "Skill", rows: require("../data/skills.js"), map: row => row },
    {
        model: "projectType",
        table: "ProjectType",
        rows: require("../data/projectTypes.js"),
        map: ({ typicalSkillIds, ...row }) => ({ ...row, typicalSkills: connect(typicalSkillIds) })
    },
    { model: "client", table: "Client", rows: require("../data/clients.js"), map: row => row },
    {
        model: "project",
        table: "Project",
        rows: require("../data/projects.js"),
        map: row => ({ ...row, startDate: date(row.startDate), midpointDate: date(row.midpointDate), endDate: date(row.endDate) })
    },
    {
        model: "mentor",
        table: "Mentor",
        rows: require("../data/mentors.js"),
        map: ({ skillIds, ...row }) => ({ ...row, skills: connect(skillIds) })
    },
    {
        model: "student",
        table: "Student",
        rows: require("../data/students.js"),
        map: ({ skillIds, ...row }) => ({ ...row, graduationDate: date(row.graduationDate), skills: connect(skillIds) })
    },
    { model: "projectStatus", table: "ProjectStatus", rows: require("../data/projectStatuses.js"), map: row => row },
    {
        model: "projectPerson",
        table: "ProjectPerson",
        rows: require("../data/projectPeople.js"),
        map: row => ({ ...row, startDate: date(row.startDate), endDate: date(row.endDate) })
    },
    { model: "projectSkill", table: "ProjectSkill", rows: require("../data/projectSkills.js"), map: row => row },
    {
        model: "personSkill",
        table: "PersonSkill",
        rows: require("../data/personSkills.js"),
        map: row => ({ ...row, lastUsed: date(row.lastUsed) })
    },
    { model: "projectProjectType", table: "ProjectProjectType", rows: require("../data/projectProjectTypes.js"), map: row => row },
    {
        model: "document",
        table: "Document",
        rows: require("../data/documents.js"),
        map: row => ({ ...row, uploadedDate: date(row.uploadedDate) })
    },
    {
        model: "channel",
        table: "Channel",
        rows: require("../data/channels.js"),
        map: ({ participantPersonIds, ...row }) => ({ ...row, createdDate: date(row.createdDate), participants: connect(participantPersonIds) })
    },
    {
        model: "thread",
        table: "Thread",
        rows: require("../data/threads.js"),
        // messageCount in the dummy data is left out; it's counted from messages instead
        map: row => ({
            id: row.id,
            channelId: row.channelId,
            name: row.name,
            createdByPersonId: row.createdByPersonId,
            createdAt: time(row.createdAt),
            lastActivityAt: time(row.lastActivityAt)
        })
    },
    {
        model: "requirement",
        table: "Requirement",
        rows: require("../data/requirements.js"),
        map: row => ({ ...row, dueDate: date(row.dueDate) })
    },
    // The first ASC Administrator, so someone can grant everyone else's roles.
    // Priya Raman runs the ASC (she's its contact on the client list).
    { model: "organizationRole", table: "OrganizationRole", rows: [{ id: 1, personId: 3, roleName: "ASC Administrator" }], map: row => row }
];

async function seedTable({ model, table, rows, map }) {
    const existing = new Set((await prisma[model].findMany({ select: { id: true } })).map(row => row.id));
    const missing = rows.filter(row => !existing.has(row.id));
    for (const row of missing) {
        await prisma[model].create({ data: map(row) });
    }
    // Move the id counter past the ids inserted by hand
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), (SELECT COALESCE(MAX(id), 0) + 1 FROM "${table}"), false)`);
    console.log(`${table}: ${missing.length} added, ${rows.length - missing.length} already there`);
}

// Messages live in MongoDB (Issue #77), in the collection the Message model
// in index.js uses. The app moves its id counter past these on startup.
async function seedMessages() {
    await mongoose.connect(process.env.MONGODB_URI);
    const collection = mongoose.connection.collection("messages");
    const rows = require("../data/messages.js").messages;
    const existing = new Set((await collection.find({}, { projection: { id: 1 } }).toArray()).map(doc => doc.id));
    if (ONLY_IF_EMPTY && existing.size > 0) {
        console.log("messages (MongoDB): already has messages, skipped");
        return;
    }
    const missing = rows.filter(row => !existing.has(row.id));
    if (missing.length) {
        await collection.insertMany(missing.map(row => ({ ...row, postedAt: time(row.postedAt), editedAt: time(row.editedAt), audit: null })));
    }
    console.log(`messages (MongoDB): ${missing.length} added, ${rows.length - missing.length} already there`);
}

async function main() {
    if (ONLY_IF_EMPTY && await prisma.person.count() > 0) {
        console.log("PostgreSQL: already has data, skipped");
    } else {
        for (const table of tables) {
            await seedTable(table);
        }
    }
    await seedMessages();
}

main()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
        await mongoose.disconnect();
    });

