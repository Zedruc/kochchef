// user types
/////////////

interface DB_UserInsert {
    firstname: string;
    surname: string;
    username: string;
    email: string;
    password: string; // bcrypt hash
    token: string; // sha256 hash
}

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

function filterUserPublic(user: DB_User | DB_UserInsert): DB_UserPublic {
    let userPublic = user as Partial<DB_User>;
    delete userPublic.email;
    delete userPublic.password;
    delete userPublic.token;

    return userPublic as DB_UserPublic;
}

const DB_USER_VALID_INSERT_KEYS = [
    'firstname',
    'surname',
    'username',
    'email',
    // 'password'
]

export {
    DB_User, DB_USER_VALID_INSERT_KEYS, DB_UserInsert, DB_UserPublic, filterUserPublic
};

