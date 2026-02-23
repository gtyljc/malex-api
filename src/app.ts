
// others
import "dotenv/config";
import * as types from "./types/index";
import { IncomingMessage } from "http";
import Cloudflare from "cloudflare";
import pino from "pino";
import { cleanEnv, str, num, email, url, port, bool } from 'envalid';
import * as utils from "@lib/utils";
import { env } from "@lib/utils";

// apollo server
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import schema from './schema';

// db
import { DatabaseSource } from "./sources";

function validateEnv(){
    return cleanEnv(
        process.env,
        {
            // list of all variables in .env

            LOG_PATH: str(),
            
            SITE_CONFIG_OPENING_AT: str(),
            SITE_CONFIG_CLOSING_AT: str(),
            SITE_CONFIG_MIN_DURATION: num(),
            SITE_CONFIG_SUPPORT_EMAIL: email(),
            SITE_CONFIG_PHONE_NUMBER: str(),
            SITE_CONFIG_TIMEZONE: str(),
            SITE_CONFIG_COUNTRY: str(),

            DATABASE_URL: url(),
            DATABASE_RECONNECTION_DELAY: num(),

            CLOUDFLARE_API_TOKEN: str(),
            CLOUDFLARE_ACCOUNT_ID: str(),

            PORT: port(),
            NODE_ENV: str(),
            PER_PAGE_LIMIT: num(),

            API_SECRET: str(),
            REFRESH_TOKEN_EXPIRATION_DELAY: num(),
            ACCESS_TOKEN_EXPIRATION_DELAY: num(),

            AUTHENTICATION: bool(),

            USER_ID_LENGTH: num(),

            ADMIN_PANEL_KEY_REFRESH_DELAY: num()
        },
        {
            reporter: ({ errors }) => {
                console.log("Some .env values wasn't found, or have not correct type: " +  Object.keys(errors))
            }
        }
    );
}

async function initApp({ logger, sources: { db, cloudflare } }){

    // set default timezone to server
    utils.dayjs.tz.setDefault((await utils.getSiteConfig(db)).timezone);

    // run server
    const server = new ApolloServer<types.AppContext>({ schema, logger });
    const { url } = await startStandaloneServer(
        server,
        {
            listen: { port: parseInt(process.env.PORT!) },
            context: async ({ req }: { req: IncomingMessage }) => {
                return { req, dataSources: { db, cloudflare } }
            }
        }
    );

    console.log("Server started at: " + url);
}

validateEnv();

// sources
const db = new DatabaseSource();
const cloudflare = new Cloudflare(
    { 
        apiToken: env("CLOUDFLARE_API_TOKEN"),
        maxRetries: 3
    }
);
export const logger = pino();

await initApp({ logger, sources: { db, cloudflare } });