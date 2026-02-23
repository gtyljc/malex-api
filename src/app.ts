
// others
import "dotenv/config";
import * as types from "./types/index";
import { IncomingMessage } from "http";
import Cloudflare from "cloudflare";
import * as utils from "@lib/utils";
import logger from "@lib/logger";
import { Logger } from "pino";

// apollo server
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import schema from './schema';

// db
import { DatabaseSource } from "./sources";

async function initApp(
    { 
        logger, 
        sources: { db, cloudflare } 
    }: { 
        logger: Logger, 
        sources: { db: DatabaseSource, cloudflare: Cloudflare } 
    }
){

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

utils.enviromentValidation();

// sources
const db = new DatabaseSource();
const cloudflare = new Cloudflare(
    { 
        apiToken: utils.env("CLOUDFLARE_API_TOKEN"),
        maxRetries: 3
    }
);

await initApp({ logger, sources: { db, cloudflare } });