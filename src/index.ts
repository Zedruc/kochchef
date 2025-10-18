import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";
import { SERVER_CONFIG } from "./server_config";
import compression from "compression";
import cookieParser from "cookie-parser";
import cookieSession from "cookie-session";
import { getCliArg } from "./helpers/cli_args";
import chalk from "chalk";
import { initDB } from "./db";

const app = express();

const SERVER_IS_PROD = getCliArg<boolean>("production") || false;
const SERVER_PORT = getCliArg<number>("port") || SERVER_CONFIG.DEFAULT_PORT;

initDB();

app.use(
    helmet({
        hidePoweredBy: true,
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    }),
    cors({
        origin: SERVER_CONFIG.CORS_ALLOWED_ORIGINS,
        credentials: true,
    }),
    compression(),
    cookieParser(process.env.COOKIE_SECRET),
    cookieSession({
        secret: process.env.COOKIE_SECRET,
        ...(SERVER_IS_PROD && {domain: "*.zedruc.net"}),
        maxAge: SERVER_CONFIG.COOKIE_MAX_AGE,
        secure: SERVER_IS_PROD,
        keys: [process.env.COOKIE_SECRET]
    }),
    json()
)

import API_USER_ROUTE from "@/routes/user_auth";

app.use("/api", API_USER_ROUTE);

app.listen(SERVER_PORT, (err) => {
    if(err) throw err;

    console.log("✅", chalk.yellow(`Server listening on port ${SERVER_PORT}`));
    
});