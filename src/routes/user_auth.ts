import { createUser, findUser } from "@/helpers/db/schemas/user";
import { handleDbError } from "@/helpers/db_error_handler";
import { databaseSelect } from "@/helpers/db_select";
import { sha256 } from "@/helpers/hashes";
import { DB_User, DB_UserInsert, DB_UserPublic } from "@/typings/db/UserType";
import HttpStatusCode from "@/typings/HttpsStatusCode";
import { compareSync } from "bcrypt";
import { Router } from "express";

const router = Router();

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

    let createdUser: { user: DB_UserPublic, token: string } | null;

    try {
        createdUser = await createUser(userValues);
    } catch (error) {
        handleDbError(error, res);
        return;
    }

    res.cookie("token", createdUser?.token, { signed: true });

    res.sendStatus(HttpStatusCode.OK);
    return;
});

router.get("/login", async (req, res) => {
    let token = req.signedCookies["token"];
    let user: DB_User | null = null;

    if (token) {
        const tokenHash = sha256(token);

        user = await findUser({ token: tokenHash });

        if (user) {
            res.sendStatus(HttpStatusCode.OK);
            return;
        }
    }

    // token but no user for it, try credentials if given
    if (!user && req.body) {
        const { username, password } = req.body;

        console.log('Trying to find user by username');


        user = await findUser({ username: username });

        if (!user) {
            res.sendStatus(HttpStatusCode.UNAUTHORIZED);
            return;
        }

        console.log('Comparing passwords');

        if (compareSync(password, user.password)) token = user.token
        else {
            res.sendStatus(HttpStatusCode.UNAUTHORIZED);
            return;
        }
    }




    if (user) res.sendStatus(HttpStatusCode.OK);
    else res.sendStatus(HttpStatusCode.UNAUTHORIZED);

});

export = router;