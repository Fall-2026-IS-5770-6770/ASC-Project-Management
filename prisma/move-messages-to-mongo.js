// One-off move of messages from PostgreSQL to MongoDB (Issue #77).
// Run it BEFORE applying the drop_messages migration, which deletes the
// Postgres table:
//   node prisma/move-messages-to-mongo.js
//   npm run db:migrate
// Messages already in MongoDB (same id) are left alone, so running it twice is
// safe. If the Postgres table is already gone there's nothing to move.
const fs = require("fs");
const path = require("path");

const envFile = path.join(__dirname, "..", ".env");
if (fs.existsSync(envFile)) {
    process.loadEnvFile(envFile);
}

const mongoose = require("mongoose");
const { PrismaClient } = require("../generated/prisma");
const { PrismaPg } = require("@prisma/adapter-pg");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
    const [{ exists }] = await prisma.$queryRaw`SELECT to_regclass('public."Message"') IS NOT NULL AS exists`;
    if (!exists) {
        console.log("The Postgres Message table is already gone; nothing to move.");
        return;
    }
    const rows = await prisma.$queryRaw`SELECT * FROM "Message" ORDER BY id`;

    await mongoose.connect(process.env.MONGODB_URI);
    // Same collection and document shape as the Message model in index.js
    const collection = mongoose.connection.collection("messages");
    const existing = new Set((await collection.find({}, { projection: { id: 1 } }).toArray()).map(doc => doc.id));
    const missing = rows.filter(row => !existing.has(row.id));
    if (missing.length) {
        await collection.insertMany(missing.map(row => ({
            id: row.id,
            threadId: row.threadId,
            channelId: row.channelId,
            senderPersonId: row.senderPersonId,
            body: row.body,
            postedAt: row.postedAt,
            editedAt: row.editedAt,
            audit: row.audit ?? null
        })));
    }
    console.log(`Messages: ${missing.length} copied to MongoDB, ${rows.length - missing.length} were already there.`);
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
