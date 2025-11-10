import HttpStatusCode from "@/types/HttpsStatusCode";
import { Router } from "express";

const router = Router();

const possibleResponses = [
    "Greetings",
    "Online",
    "Why are you looking at this"
]

router.get("/", (req, res) => {
    res.status(HttpStatusCode.OK);
    res.json({
        status: HttpStatusCode.OK,
        message: possibleResponses[Math.floor(Math.random() * possibleResponses.length)],
        version: "1.0.0",
    })
});

export = router;