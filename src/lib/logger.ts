
import pino from "pino";
import { env } from "./utils";
import path from "node:path";

const BASE_DIR = process.cwd();

export default pino(
    {
        name: "RootLogger",
        level: env("LOG_LEVEL"),
        transport: {
            target: "pino-pretty",
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
            singleLine: true,
        }
    },
    pino.destination(
        { dest: path.join(BASE_DIR, env("LOG_PATH")) }
    )
);