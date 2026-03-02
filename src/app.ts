

// others
import "dotenv/config";
import * as utils from "@lib/utils"; // don't move, its important
import Cloudflare from "cloudflare";
import { env } from "@lib/utils";
import logger from "@lib/logger";

// types
import { IncomingMessage } from "http";
import { Logger } from "pino";
import * as types from "./types/index";
import { DatabaseSource } from "./sources";

// apollo server
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import express from "express";
import schema from './schema';
import http from "http";
import { rateLimit } from 'express-rate-limit'

function emptyMiddleware(
    req: http.IncomingMessage, 
    res: http.OutgoingMessage, 
    next: Function
){
    next();
}

async function initApp(
    { 
        logger, 
        sources: { db, cloudflare } 
    }: { 
        logger: Logger, 
        sources: { db: DatabaseSource, cloudflare: Cloudflare } 
    }
){
    logger.info("Initializing API...")

    // set default timezone to server
    utils.dayjs.tz.setDefault((await utils.getSiteConfig(db)).timezone);

    // run server
    const app = express();
    const limiter = env("RATE_LIMITER") ? rateLimit(
        {
            windowMs: env("WINDOW_DURATION"),
            limit: env("PER_WINDOW_LIMIT"),
            legacyHeaders: false,
            validate: {
                trustProxy: true,
                ip: true
            }
        }
    ): emptyMiddleware;
    const httpServer = http.createServer(app);
    const server = new ApolloServer<types.AppContext>(
        { 
            schema, 
            logger,
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        }
    );
    const url = new URL(env("BASE_URL"));

    await server.start();

    app.use(
        "/graphql",
        limiter,
        express.json(),
        expressMiddleware(
            server, 
            {
                context: async ({ req }: { req: IncomingMessage }) => {
                    return { req, dataSources: { db, cloudflare } }
                }
            }
        )
    )

    httpServer.listen({ port: url.port })

    logger.info("API successfully started at: " + env("BASE_URL"));
}

// sources
const db = new DatabaseSource();
const cloudflare = new Cloudflare(
    { 
        apiToken: env("CLOUDFLARE_API_TOKEN"),
        maxRetries: 3
    }
);

await initApp({ logger, sources: { db, cloudflare } });