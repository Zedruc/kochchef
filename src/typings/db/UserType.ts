interface DB_UserInsert {
    firstname: string;
    surname: string;
    username: string;
    email: string;
    password: string; // bcrypt hash
}

const validInsertKeys = [
    'firstname',
    'surname',
    'username',
    'email',
    'password'
]

interface DB_User {
    readonly user_id: number;
    firstname: string;
    surname: string;
    username: string;
    email: string;
    password: string; // bcrypt hash
    readonly created_at: Date;
    token: string; // sha256 hash
}

interface DB_UserPublic {
    readonly user_id: number;
    firstname: string;
    surname: string;
    username: string;
    // filter email: string;
    // filter password: string;
    readonly created_at: Date;
    token: string; // sha256 hash
}

function filterUserPublic(user: DB_User): DB_UserPublic {
    let userPublic = user as Partial<DB_User>;
    delete userPublic.email;
    delete userPublic.password;
    delete userPublic.token;

    return userPublic as DB_UserPublic;
}

export {
    DB_UserInsert,
    DB_User,
    DB_UserPublic,
    filterUserPublic
}