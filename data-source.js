const { DataSource } = require("typeorm");

const postgreSQL = new DataSource({
    type: "postgres",
    host: "db.toapita.com",
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    ssl: { rejectUnauthorized: false },
    synchronize: true,
    entities: [__dirname + "/entities/**/*{.js,.ts}"],
});

module.exports = postgreSQL;