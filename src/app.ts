

// others
import "dotenv/config";
import * as utils from "@lib/utils"; // don't move, its important
import { env } from "@lib/utils";
import logger from "@lib/logger";
import * as sources from "./sources";

// GraphQL schema
import directives from "./directives";
import execSchema from "./schema";

// types
import { IncomingMessage, OutgoingMessage } from "http";
import * as types from "./lib/types/index";
import { GraphQLSchema } from "graphql";

// apollo server
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import http from "http";
import { rateLimit } from 'express-rate-limit'
import { createATMiddleware, createRTMiddleware } from "./middlewares";
import { ChangeResponseStatusPlugin } from "./plugins";

// express
import express from "express";
import cors from "cors";
import cookiesParser from "cookie-parser";

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
    maxAge: 86400, // 24 hours
    credentials: true
};
const EXPRESS_MIDDLEWARE_OPTIONS = {
    context: async ({ req, res }: { req: IncomingMessage, res: OutgoingMessage }) => {
        return { 
            req, 
            res, 
            dataSources: { 
                db: sources.DBSource, 
                cloudflare: sources.CloudflareSource, 
                redis: sources.RedisSource 
            } 
        }
    }
};

logger.info("App is starting...");

logger.info("Loading schemas...");

// schema packer, loocking into schemas and resolver directories

function addDirectives(schema: GraphQLSchema, schemaMappers: Function[]){
    let temporarySchema = schema;
    
    for (let mapper of schemaMappers){
        temporarySchema = mapper(schema) 
    }

    return temporarySchema;
};

addDirectives(execSchema, directives);

logger.info("Setting up timezone to server...");

// set default timezone to server
utils.dayjs.tz.setDefault((await utils.getSiteConfig(sources.DBSource)).timezone);

// initiating server and configure express app with middlewares
logger.info("Setting up express app...")

const exApp = express();
const httpServer = http.createServer(exApp);
const apolloServer = new ApolloServer<types.AppContext>(
    { 
        schema: execSchema,
        logger,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            new ChangeResponseStatusPlugin()
        ],
    }
);

function emptyMiddleware(_, __, next: Function){
    next();
}

await apolloServer.start();

exApp.use(
    "/graphql",
    cors(CORS_OPTIONS),
    cookiesParser(),
    env("RATE_LIMITER") ? rateLimit(LIMITER_OPTIONS): emptyMiddleware,
    express.json(),
    expressMiddleware(apolloServer, EXPRESS_MIDDLEWARE_OPTIONS)
)

// to create RT
exApp.post(
    "/rt/create",
    express.json(),
    createRTMiddleware(sources.RedisSource)
)

exApp.post(
    "/at/create",
    express.json(),
    createATMiddleware(sources.RedisSource)
)

httpServer.listen({ host: env("HOST"), port: env("PORT") });

logger.info("App is ready to use!");