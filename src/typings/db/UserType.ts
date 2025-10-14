interface DB_UserInsert {
    firstname: string;
    surname: string;
    username: string;
    email: string;
    password: string; // bcrypt hash
}

interface User {
    readonly user_id: number; // auto db pk
    firstname: string;
    surname: string;
    username: string;
    email: string;
    password: string; // bcrypt hash
    readonly created_at: Date; // auto db
    readonly uuid: string; // auto db
}

export {
    DB_UserInsert,
    User
}