

// others
import "dotenv/config";
import * as utils from "@lib/utils"; // don't move, its important
import { env } from "@lib/utils";
import logger from "@lib/logger";
import { DBSource, CloudflareSource, RedisSource } from "./sources";
import * as responses from "@lib/responses";

// types
import { type ResponseError } from "@lib/errors";
import { IncomingMessage, OutgoingMessage } from "http";
import * as types from "./lib/types/index";
import { GraphQLSchema } from "graphql";
import { 
    ApolloServerPlugin, 
    BaseContext, 
    GraphQLRequestContextDidEncounterErrors, 
    GraphQLRequestContextWillSendResponse, 
    GraphQLRequestListener 
} from "@apollo/server";

// apollo server
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { expressMiddleware } from '@as-integrations/express5';
import http from "http";
import { rateLimit } from 'express-rate-limit'
import { validateATCreateRequest, validateRTCreateRequest } from "./auth/server-auth";

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

class ChangeResponseStatusListener implements GraphQLRequestListener<BaseContext> {
    originalError: ResponseError | undefined;

    async didEncounterErrors(requestContext: GraphQLRequestContextDidEncounterErrors<BaseContext>): Promise<void> {
        this.originalError = requestContext.errors[0].originalError as ResponseError;
        let code;

        if (!this.originalError.code) code = 500;

        requestContext.response.http.status = this.originalError.code;
    }

    async willSendResponse(requestContext: GraphQLRequestContextWillSendResponse<BaseContext>): Promise<void> {
        if(this.originalError){
            let apiResponse: types.APIResponse;

            if (!this.originalError.apiResponse) apiResponse = responses.f500Response();

            requestContext.response.body = {
                kind: "single",
                singleResult: {
                    data: this.originalError.apiResponse
                }
            }
        }
    }
}

class ChangeResponseStatusPlugin implements ApolloServerPlugin {
    async requestDidStart(): Promise<GraphQLRequestListener<BaseContext>> {    
        return new ChangeResponseStatusListener();
    }
}

function emptyMiddleware(_, __, next: Function){
    next();
}

function setUpMiddlewares(app: ReturnType<typeof express>, apolloServer: ApolloServer<any>): void {
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

    // to create RT
    app.post(
        "/rt/create",
        express.json(),
        validateRTCreateRequest(RedisSource)
    )

    app.post(
        "/at/create",
        express.json(),
        validateATCreateRequest(RedisSource)
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
            plugins: [
                ApolloServerPluginDrainHttpServer({ httpServer }),
                new ChangeResponseStatusPlugin()
            ],
        }
    );

    await apolloServer.start();

    setUpMiddlewares(app, apolloServer);

    httpServer.listen({ port: env("PORT"), host: env("HOSTNAME") })

    logger.info("API successfully started at: " + `${env("PROTOCOL")}://${env("HOSTNAME")}:${env("PORT")}/graphql`);
}

await setUpApp();