import { createUser } from "@/helpers/db/schemas/user";
import { DB_UserInsert } from "@/typings/db/UserType";
import HttpStatusCode from "@/typings/HttpsStatusCode";
import { Router } from "express";

const router = Router();

router.post("/register", (req, res) => {
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

    try {
        createUser(userValues);
        res.sendStatus(HttpStatusCode.OK);
        return;
    } catch (error) {
        res.sendStatus(HttpStatusCode.INTERNAL_SERVER_ERROR);
        return;
    }

});

export = router;