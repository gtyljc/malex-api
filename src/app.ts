

// others
import "dotenv/config";
import * as utils from "@lib/utils"; // don't move, its important
import { env } from "@lib/utils";
import logger from "@lib/logger";
import { DBSource, CloudflareSource, RedisSource } from "./sources";

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
import { validateRTCreateRequest } from "./refresh-token";

// GraphQL schema
import schema, { addDirectives } from './schema';
import directives from "./directives";

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
        return { req, res, dataSources: { db: DBSource, cloudflare: CloudflareSource, redis: RedisSource } }
    }
};

function setUpMiddlewares(app: ReturnType<typeof express>, apolloServer: ApolloServer<any>): void {
    function emptyMiddleware(_, __, next: Function){
        next();
    }

    const limiter = env("RATE_LIMITER") ? rateLimit(LIMITER_OPTIONS): emptyMiddleware;

    // to apollo server
    app.use(
        "/graphql",
        cors(CORS_OPTIONS),
        cookiesParser(),
        limiter,
        express.json(),
        expressMiddleware(apolloServer, EXPRESS_MIDDLEWARE_OPTIONS)
    )

    const createRTPath = "/rt/create";

    // to create RT
    app.post(
        createRTPath,
        express.json(),
        validateRTCreateRequest(RedisSource)
    )
}

function setUpSchema(schema: GraphQLSchema): GraphQLSchema {
    return addDirectives(schema, directives);
}

async function setUpApp(): Promise<void> {
    logger.info("Initializing API...")

    // set default timezone to server
    utils.dayjs.tz.setDefault((await utils.getSiteConfig(DBSource)).timezone);

    // run server
    const app = express();
    const httpServer = http.createServer(app);
    const apolloServer = new ApolloServer<types.AppContext>(
        { 
            schema: setUpSchema(schema),
            logger,
            plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
        }
    );

    await apolloServer.start();

    setUpMiddlewares(app, apolloServer);

    const url = new URL(env("BASE_URL"));

    httpServer.listen({ port: url.port })

    logger.info("API successfully started at: " + env("BASE_URL") + "graphql");
}

await setUpApp();