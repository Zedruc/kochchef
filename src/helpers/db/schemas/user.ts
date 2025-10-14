import chalk from "chalk";
import { pool } from "..";
import { genSaltSync, hash, hashSync } from "bcrypt";
import { DB_UserInsert } from "@/typings/db/UserType"

function handleError(error: any) {
    console.log(chalk.bold.red("❌ MariaDB Error:"), error);
}

async function createUser(userSchemaOptions: DB_UserInsert): Promise<DB_UserInsert | null> {
    const { firstname, surname, username, email, password } = userSchemaOptions;

    const conn = await pool.getConnection()

    try {
        const SALT_MIN = 8;
        const SALT_MAX = 32;

        const saltRounds = Math.round( Math.min((Math.random() * SALT_MAX ) + SALT_MIN, SALT_MAX) );

        console.log(saltRounds, typeof saltRounds);
        
        
        const salt = genSaltSync(saltRounds);
        console.log(salt, typeof salt);
        

        const passwordHash = hashSync(password, salt);

        const newUser = await pool.query(
            "INSERT INTO user (firstname, surname, username, email, password) VALUES (?, ?, ?, ?, ?)",
            [firstname, surname, username, email, passwordHash]
        )

        console.log('User created');

        return newUser;
    } catch (error) {
        console.log(error);
    } finally {
        if (conn) conn.release();
    }

    return null;
}

export {
    DB_UserInsert as DB_Benutzer,
    createUser
}