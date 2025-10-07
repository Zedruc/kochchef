import { pool } from "..";

export interface UserSchemaOptions {
    name: string;
    email: string;
    age: number;
    created: number;
}

async function createUser(userSchemaOptions: UserSchemaOptions) {
    const {name, email, age, created} = userSchemaOptions;
    const newUser = await pool.query(
        "INSERT (name, email, age, created) INTO TABLE users VALUES (?, ?, ?, ?)",
        [name, email, age, created]
    )
}