import HttpStatusCode from "@/typings/HttpsStatusCode";
import { Response } from "express";

function handleDbError(error: any, res: Response<any, Record<string, any>>) {
    console.error(error);
    switch (error.code) {
        case "ER_DUP_ENTRY":
            res.sendStatus(HttpStatusCode.CONFLICT);
            break;

        default:
            res.sendStatus(HttpStatusCode.INTERNAL_SERVER_ERROR);
            break;
    }
}

export { handleDbError }