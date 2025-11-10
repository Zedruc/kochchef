import { databaseUpdate } from "@/db/functions";
import { DB_User } from "@/db/schemas/user";
import { findOne } from "@/helpers/db_select";
import { sha256 } from "@/helpers/hashes";
import HttpStatusCode from "@/types/HttpsStatusCode";
import { type Request, type Response, type NextFunction } from "express";
import { v7 } from "uuid";

const TOKEN_VALIDITY_PERIOD = 1000 * 60 * 60 * 24 * 7; // 7 days

export async function validateUserToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const token = req.signedCookies["token"];
    
    if (!token) {
        // maybe no account exists, just ignore
        console.log("No token");
        
        next();
        return;
    }

    const tokenHash = sha256(token);

    if (req.path == "/api/user/register" || req.path == "/api/user/login") {
        // ignore these paths
        next();
        return;
    }

    const user = await findOne<DB_User>(
        { token: tokenHash },
        ["token_created_at"],
        "user"
    );
    if (!user) {
        console.log("[TOK VAL] no user found");
        
        res.sendStatus(HttpStatusCode.NOT_FOUND);
        return;
    }

    const now = Date.now();
    const tokenCreated = new Date(user.token_created_at).getTime();

    if (now - tokenCreated > TOKEN_VALIDITY_PERIOD) {
        // session token expired
        const newToken = v7();
        const newTokenHash = sha256(newToken);

        // set new token in db
        await databaseUpdate("user", { token: newTokenHash }, { token: token });

        // send user to login to retrieve new token
        res.redirect("/login");
        next();
        return;
    }
}
