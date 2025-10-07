import chalk from "chalk";
import mariadb from "mariadb";

const pool = mariadb.createPool({
    host: process.env.MARIADB_HOST,
    port: process.env.MARIADB_PORT ? Number(process.env.MARIADB_PORT) : 3306,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    database: process.env.MARIADB_DATABASE,
    charset: "utf8mb4",
    connectionLimit: 5,
});

// set up sql
let initRan = false;

async function initDB() {
    // protection against initializing multiple times on accident
    console.log('running db init');
    if (initRan) return;
    initRan = true;

    let conn;
    try {
        conn = await pool.getConnection(); // connection test
        console.log(chalk.bold.green("📦 Connected to MariaDB"));

        await conn.query(`
        CREATE TABLE IF NOT EXISTS users (
            user_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
            name TEXT,
            email TEXT,
            age INT,
            created TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `)
    } catch (error) {
        console.log(chalk.bold.red("❌ MariaDB Error:"), error);
    } finally {
        if (conn) conn.release();
    }
}

export {pool, initDB};