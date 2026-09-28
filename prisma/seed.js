// Loads the dummy data in data/ into the database. Rows are inserted with their
// dummy data ids, and any id that already exists is left alone, so running it
// again only fills in what's missing.
//   npx prisma db seed
const fs = require("fs");
const path = require("path");

const envFile = path.join(__dirname, "..", ".env");
if (fs.existsSync(envFile)) {
    process.loadEnvFile(envFile);
}

const { PrismaClient } = require("../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

// Dummy data dates are YYYY-MM-DD strings; the database stores them as dates
function date(value) {
    return value ? new Date(`${value}T00:00:00Z`) : null;
}

// Link a many-to-many relation to existing rows by id
function connect(ids) {
    return { connect: (ids || []).map(id => ({ id })) };
}

// In dependency order: a table only points at tables above it
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
    { model: "projectSkill", table: "ProjectSkill", rows: require("../data/projectSkills.js"), map: row => row }
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

async function main() {
    for (const table of tables) {
        await seedTable(table);
    }
}

main()
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());

