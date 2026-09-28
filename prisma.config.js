// Prisma CLI settings. Prisma 7 no longer reads .env on its own, so load it here.
const fs = require("fs");
const path = require("path");
const { defineConfig, env } = require("prisma/config");

const envFile = path.join(__dirname, ".env");
if (fs.existsSync(envFile)) {
    process.loadEnvFile(envFile);
}

module.exports = defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "node prisma/seed.js"
    },
    datasource: {
        url: env("DATABASE_URL")
    }
});
