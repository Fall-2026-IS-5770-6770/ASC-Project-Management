// Loads the dummy data in data/ into the database. Tables that already have
// rows are left alone, so running it again is safe.
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

// In dependency order: a table only points at tables above it
const tables = [
    { model: "status", table: "Status", rows: require("../data/statuses.js"), map: row => row },
    { model: "mainBoardStatus", table: "MainBoardStatus", rows: require("../data/mainBoardStatuses.js"), map: row => row },
    { model: "person", table: "Person", rows: require("../data/people.js"), map: row => row }
];

async function seedTable({ model, table, rows, map }) {
    if (await prisma[model].count() > 0) {
        console.log(`${table}: already has rows, skipped`);
        return;
    }
    for (const row of rows) {
        await prisma[model].create({ data: map(row) });
    }
    // Rows were inserted with their dummy data ids, so move the id counter past them
    await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), (SELECT COALESCE(MAX(id), 0) + 1 FROM "${table}"), false)`);
    console.log(`${table}: ${rows.length} rows`);
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

