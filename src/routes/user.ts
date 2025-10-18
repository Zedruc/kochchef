import { DB_USER_VALID_INSERT_KEYS, filterUserPublic } from "@/db/schemas/user";
import { handleDbError } from "@/helpers/db_error_handler";
import { bcryptHashPassword, sha256 } from "@/helpers/hashes";
import { DB_User, DB_UserInsert, DB_UserPublic } from "@/db/schemas/user";
import HttpStatusCode from "@/types/HttpsStatusCode";
import { compareSync } from "bcrypt";
import { Router } from "express";
import { databaseDelete, databaseInsert, databaseUpdate } from "@/db/functions";
import { databaseSelect } from "@/helpers/db_select";
import { v7 as uuid_v7 } from "uuid";

const router = Router();

async function findUser(criteria: Partial<DB_User>, toSelect: (keyof DB_User)[] | ['*']): Promise<DB_User | null> {
    let users = await databaseSelect<DB_User>(
        toSelect,
        "user",
        Object.keys(criteria),
        Object.values(criteria)
    );

    if (!users) return null;

    return users[0];
}

async function userExists(token: string) {
    let user = findUser({token: sha256(token)}, ["token"]);
    return !!user;
}

// auth and management related routes
/////////////////////////////////////

router.post("/register", async (req, res) => {
    if (!req.body) {
        console.log('No body');

        res.sendStatus(HttpStatusCode.BAD_REQUEST);
        return;
    }

    const userValues: DB_UserInsert = req.body;

    if (!userValues.firstname || !userValues.surname || !userValues.username || !userValues.email || !userValues.password) {
        res.sendStatus(HttpStatusCode.BAD_REQUEST);
        return;
    }

    const userToken = uuid_v7();
    const userTokenHash = sha256(userToken);

    const userPasswordBcrypt = bcryptHashPassword(userValues.password);

    try {
        await databaseInsert<DB_UserInsert>("user", Object.assign(userValues, {password: userPasswordBcrypt, token: userTokenHash}));
    } catch (error) {
        handleDbError(error, res);
        return;
    }

    res.cookie("token", userToken, { signed: true });

    res.sendStatus(HttpStatusCode.OK);
    return;
});

router.get("/login", async (req, res) => {
    let token = req.signedCookies["token"];
    let user: DB_User | null = null;

    if (token) {
        const tokenHash = sha256(token);

        user = await findUser({ token: tokenHash }, ["token"]);

        if (user) {
            res.sendStatus(HttpStatusCode.OK);
            return;
        } else {
            // token expired or account deleted
            res.sendStatus(HttpStatusCode.UNAUTHORIZED);
            return;
        }
    }

    // token but no user for it, try credentials if given
    if (!user && req.body) {
        const { username, password } = req.body;

        user = await findUser({ username: username }, ["token"]);

        if (!user) {
            res.sendStatus(HttpStatusCode.UNAUTHORIZED);
            return;
        }

        if (compareSync(password, user.password)) token = user.token
        else {
            res.sendStatus(HttpStatusCode.UNAUTHORIZED);
            return;
        }
    }

    if (user) res.sendStatus(HttpStatusCode.OK);
    else res.sendStatus(HttpStatusCode.UNAUTHORIZED);

});

router.patch("/update", async (req, res) => {
    const userToken = req.signedCookies["token"] as string;

    const payload: Partial<DB_UserInsert> = req.body;
    const payloadKeys = Object.keys(payload);

    if (payloadKeys.some(key => !DB_USER_VALID_INSERT_KEYS.includes(key))) {
        res.sendStatus(HttpStatusCode.BAD_REQUEST);
        return;
    }

    if (!userExists(userToken)) {
        res.sendStatus(HttpStatusCode.BAD_REQUEST);
        return;
    }

    try {
        const wasUpdated = await databaseUpdate("user", payload, {token: sha256(userToken)});

        if(wasUpdated) res.sendStatus(HttpStatusCode.OK);
        else res.sendStatus(HttpStatusCode.NOT_MODIFIED);

        return;
    } catch (error) {
        handleDbError(error, res);
    }
});

router.delete("/delete", async (req, res) => {
    const userToken = req.signedCookies["token"] as string;

    if (!userExists(userToken)) {
        res.sendStatus(HttpStatusCode.UNAUTHORIZED);
        return;
    }

    databaseDelete("user", {token: sha256(userToken)});
});


// query route
//////////////

router.get("/:username", async (req, res) => {
    const username = req.params.username;
    const token = req.signedCookies["token"] as string;

    if(!token || !(await findUser({ token: sha256(token) }, ["token"]))) {
        res.sendStatus(HttpStatusCode.UNAUTHORIZED);
        return;
    }

    const user = await findUser(
        {username: username},
        ["user_id", "firstname", "surname", "username", "created_at"]
    );

    if(!user) {
        res.sendStatus(HttpStatusCode.NOT_FOUND);
        return;
    }

    res.json(user);
    
});

export = router;