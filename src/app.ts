
// others
import * as types from "./types/index";
import { IncomingMessage } from "http";
import Cloudflare from "cloudflare";
import { getSiteConfig } from "./tools";
import { dayjs } from "@lib/dayjs";

// apollo server
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import schema from './schema';

// db
import { connection, DatabaseSource } from "./sources";
import { setSiteConfig } from "@lib/prisma/generated/sql";
import { setTimezone } from "@lib/prisma/generated/sql";

const db = new DatabaseSource();
const cloudflare = new Cloudflare(
    { 
        apiToken: process.env.CLOUDFLARE_API_TOKEN,
        maxRetries: 3 
    }
);

// set site config
connection.client.$executeRaw(
    setSiteConfig(
        process.env.OPENING_AT!,
        process.env.CLOSING_AT!,
        parseInt(process.env.MIN_DURATION!),
        process.env.SUPPORT_EMAIL!,
        process.env.PHONE_NUMBER!,
        process.env.TIMEZONE!
    )
);

// set timezone to DB
connection.client.$executeRawUnsafe(setTimezone());

// set default timezone to server
dayjs.tz.setDefault((await getSiteConfig(db)).timezone);

// run server
const server = new ApolloServer<types.AppContext>({ schema });
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