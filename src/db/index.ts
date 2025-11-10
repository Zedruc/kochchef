import chalk from "chalk";
import { readFileSync } from "fs";
import mariadb from "mariadb";
import { join } from "path";

let pool = mariadb.createPool({
    host: process.env.MARIADB_HOST,
    port: process.env.MARIADB_PORT ? Number(process.env.MARIADB_PORT) : 3306,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    charset: "utf8mb4", // 4mb utf8 weil emojis
    connectionLimit: 5,
    multipleStatements: true,
});

// setup sql
let initRan = false;

async function initDB() {
    // protection against initializing multiple times on accident
    if (initRan) return;
    initRan = true;

    let conn;
    try {
        conn = await pool.getConnection(); // connection test
        
        console.log(chalk.bold.green("MariaDB Connected"));

        const sqlFile = join(__dirname, "setup.sql");
        const sql = readFileSync(sqlFile, "utf-8");

        await conn.query(sql);
    } catch (error) {
        console.log(chalk.bold.red("❌ MariaDB Error:"), error);
    } finally {
        if (conn) conn.release();
    }
}

export {pool, initDB};