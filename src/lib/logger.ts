
import pino from "pino";
import { env } from "./utils";
import { join } from "node:path";

const BASE_DIR = process.cwd();

export default pino(
    {
        name: "RootLogger",
        level: env("LOG_LEVEL"),
        transport: {
            target: "pino-pretty",
            options: {
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
                singleLine: true,
                // destination: join(BASE_DIR, env("LOG_PATH"))
            },
        }
    }
);