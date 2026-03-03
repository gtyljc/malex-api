

// others
import "dotenv/config";
import * as utils from "@lib/utils"; // don't move, its important
import { env } from "@lib/utils";
import logger from "@lib/logger";

// types
import { IncomingMessage } from "http";
import * as types from "./types/index";

// sources
import { DatabaseSource } from "./sources";
import Cloudflare from "cloudflare";
import { createClient } from "redis";

// apollo server
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import express from "express";
import cors from "cors";
import schema from './schema';
import http from "http";
import { rateLimit } from 'express-rate-limit'

// sources
const db = new DatabaseSource();
const cloudflare = new Cloudflare(
    { 
        apiToken: env("CLOUDFLARE_API_TOKEN"),
        maxRetries: 3
    }
);
const redis = createClient({ url: env("REDIS_URL") });

// configuration
const LIMITER_OPTIONS = {
    windowMs: env("WINDOW_DURATION"),
    limit: env("PER_WINDOW_LIMIT"),
    legacyHeaders: false,
    validate: {
        trustProxy: true,
        ip: true
    }
};
const CORS_OPTIONS = {
    origin: [ env("BACKEND_ORIGIN") ],
    methods: [ "POST" ],
    allowedHeaders: [ "Authorization", "Content-Type" ],
    maxAge: 86400 // 24 hours
};
const EXPRESS_MIDDLEWARE_OPTIONS = {
    context: async ({ req }: { req: IncomingMessage }) => {
        return { req, dataSources: { db, cloudflare, redis } }
    }
};

async function initApp(){
    function emptyMiddleware(
        req: http.IncomingMessage, 
        res: http.OutgoingMessage, 
        next: Function
    ){
        next();
    }

    logger.info("Initializing API...")

    // set default timezone to server
    utils.dayjs.tz.setDefault((await utils.getSiteConfig(db)).timezone);

    // run server
    const app = express();
    const limiter = env("RATE_LIMITER") ? rateLimit(LIMITER_OPTIONS): emptyMiddleware;
    const httpServer = http.createServer(app);
    const apolloServer = new ApolloServer<types.AppContext>(
        { 
            schema,
            logger,
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        }
    );

    await apolloServer.start();

    app.use(
        "/graphql",
        cors(CORS_OPTIONS),
        limiter,
        express.json(),
        expressMiddleware(apolloServer, EXPRESS_MIDDLEWARE_OPTIONS)
    )

    const url = new URL(env("BASE_URL"));

    httpServer.listen({ port: url.port })

    logger.info("API successfully started at: " + env("BASE_URL") + "graphql");
}

await initApp();