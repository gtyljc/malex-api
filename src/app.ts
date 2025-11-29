
// others
import * as types from "./types/index.ts";
import { IncomingMessage } from "http";

// apollo server
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import schema from './schema.ts';

// db
import { DatabaseSource, DatabaseConnectionStatus } from './sources.ts';
import { PrismaClient } from '../prisma/generated/client.js';

const prisma = new PrismaClient();
const connectionStatus = new DatabaseConnectionStatus(prisma);
const { typeDefs, resolvers } = schema;
const server = new ApolloServer<types.AppContext>({ typeDefs, resolvers });
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