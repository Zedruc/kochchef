import { genSaltSync, hashSync } from "bcrypt";
import crypto from "crypto";

function bcryptHashPassword(password: string): string {
    const SALT_MIN = 10;
    const SALT_MAX = 14;

    const saltRounds = Math.round(Math.min((Math.random() * SALT_MAX) + SALT_MIN, SALT_MAX));

    const passwordHash = hashSync(password, saltRounds);

    return passwordHash;
}

function sha256(str: string) {
    const hash = crypto.createHash("sha256").update(str).digest("hex");
    return hash;
}

function verifySha256(plain: string, hash: string): boolean {
    return sha256(plain) === hash;
}

export {
    bcryptHashPassword,
    sha256,
    verifySha256
}