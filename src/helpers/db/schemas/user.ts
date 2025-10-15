import { bcryptHashPassword, sha256 } from "@/helpers/hashes";
import { DB_User, DB_UserInsert, DB_UserPublic, filterUserPublic } from "@/typings/db/UserType";
import chalk from "chalk";
import crypto from "crypto";
import { v7 as uuidv7 } from "uuid";
import { pool } from "..";
import { databaseSelect } from "@/helpers/db_select";

function handleError(error: any) {
    console.log(chalk.bold.red("❌ DB user.ts Error:\n"), error);
    throw error;
}

async function createUser(userSchemaOptions: DB_UserInsert): Promise<{user: DB_UserPublic, token: string} | null> {
    const { firstname, surname, username, email, password } = userSchemaOptions;

    const conn = await pool.getConnection()

    try {

        const plainToken = uuidv7();
        const hashedToken = sha256(plainToken);

        const hashedPassword = bcryptHashPassword(password);

        if (!hashedToken || !hashedPassword) {
            console.log(chalk.bold.red("Failed to hash while creating user."));
            return null;
        }

        const newUser: DB_User = await pool.query(
            "INSERT INTO user (firstname, surname, username, email, password, token) VALUES (?, ?, ?, ?, ?, ?)",
            [firstname, surname, username, email, hashedPassword, hashedToken]
        )

        return {
            user: filterUserPublic(newUser),
            token: plainToken
        };
    } catch (error) {
        handleError(error);
    } finally {
        if (conn) conn.release();
    }

    return null;
}

async function updateUser(userToken: string, userSchemaOptions: Partial<DB_UserInsert>): Promise<Partial<DB_UserInsert> | null> {
    const keys = Object.keys(userSchemaOptions);
    const values = Object.values(userSchemaOptions);

    if (keys.includes('password')) {
        // for security reasons needs to be changed using a separate function
        console.log(chalk.bold.red('!'), "password in requested change, rejecting. Use updatePassword() instead.");
        return null;
    }

    if (keys.length === 0) return null;

    const conn = await pool.getConnection();

    try {
        const setExpression = keys.map(key => `${key} = ?`).join(', ');

        const updatedUser = await pool.query(`UPDATE user SET ${setExpression}`, [...values, userToken]);

        return updatedUser;
    } catch (error) {
        handleError(error);
    } finally {
        if (conn) conn.release();
    }

    return null;
}

async function updatePassword(userToken: string, newPassword: string): Promise<boolean> {
    const conn = await pool.getConnection();
    try {
        const hashedPassword = bcryptHashPassword(newPassword);

        if (!hashedPassword) {
            console.log(chalk.bold.red("Failed to hash password while updating user password."));
            return false;
        }

        const updatedUser = conn.query("UPDATE user SET password = ? WHERE token = ?", [bcryptHashPassword(newPassword), userToken]);

        return !!updatedUser;
    } catch (error) {
        handleError(error);
        return false;
    } finally {
        if (conn) conn.release();
    }
}

async function deleteUser(userToken: string): Promise<boolean> {
    const conn = await pool.getConnection();
    try {
        const updatedUser = conn.query("DELETE FROM user WHERE token = ?", [userToken]);
        return !!updatedUser;
    } catch (error) {
        handleError(error);
        return false;
    } finally {
        if (conn) conn.release();
    }
}

async function findUser(criteria: Partial<DB_User>, toSelect = ['*']): Promise<DB_User | null> {
    let users = await databaseSelect<DB_User>(
        toSelect,
        "user",
        Object.keys(criteria),
        Object.values(criteria)
    );

    if(!users) return null;
    
    return users[0];
}

export {
    createUser, DB_UserInsert as DB_Benutzer, deleteUser, updatePassword, updateUser, findUser
};
