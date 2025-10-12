
// apollo server
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

// db
import { PrismaClient } from '../prisma/generated/client.js';
import { withAccelerate } from "@prisma/extension-accelerate";


const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(
    server,
    {
        listen: {port: 4000},
        context: async () => {
            return {
                prisma: new PrismaClient().$extends(withAccelerate())
            }
        }
    }
);

console.log("Server started at: " + url);