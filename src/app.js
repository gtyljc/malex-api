
// apollo server
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import schema from './schema.js';
import dotenv from "dotenv";

// db
import { 
    DatabaseSource, 
    CloudflareImagesStorageAPI, 
    DatabaseConnectionStatus
} from './data-sources.js';
import { PrismaClient } from '../prisma/generated/index.js';

// parse .env
dotenv.config();

// db config
const prisma = new PrismaClient();
const connectionStatus = new DatabaseConnectionStatus(prisma);

const { typeDefs, resolvers } = schema;
const server = new ApolloServer(
    { 
        typeDefs,
        resolvers, 
        dataSources: () => ({ db: new DatabaseSource() }) 
    }
);
const { url } = await startStandaloneServer(
    server,
    {
        listen: { port: 2000 },
        context: async () => {
            return {
                dataSources: {
                    db: new DatabaseSource(prisma, connectionStatus),
                    imgCloudAPI: new CloudflareImagesStorageAPI(
                        process.env.CLOUDFLARE_API_TOKEN, 
                        process.env.CLOUDFLARE_ACCOUNT_ID
                    )
                }
            }
        }
    }
);

console.log("Server started at: " + url);