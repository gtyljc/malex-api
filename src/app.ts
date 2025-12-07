
// others
import * as types from "./types/index";
import { IncomingMessage } from "http";

// apollo server
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import schema from './schema';

// db
import { DatabaseSource, DatabaseConnectionStatus } from './sources';
import { PrismaClient } from '../prisma/generated/client.js';

// load .env file
process.loadEnvFile();

const prisma = new PrismaClient();
const connectionStatus = new DatabaseConnectionStatus(prisma);
const server = new ApolloServer<types.AppContext>({ schema });
const { url } = await startStandaloneServer(
    server,
    {
        listen: { port: 2000 },
        context: async ({ req }: { req: IncomingMessage }) => {
            return {
                req,
                dataSources: {
                    db: new DatabaseSource(prisma, connectionStatus)
                }
            }
        }
    }
);

console.log("Server started at: " + url);