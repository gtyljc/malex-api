
// apollo server
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import typeDefs from './schema.js';
import resolvers from './resolvers.js';
import dotenv from "dotenv";

// db
import {DatabaseSource, CloudflareImagesStorageAPI} from './data-sources.js';

// parse .env
dotenv.config();

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(
    server,
    {
        listen: {port: 4000},
        context: async () => {
            return {
                dataSources: {
                    db: new DatabaseSource(),
                    imgCloudAPI: new CloudflareImagesStorageAPI(process.env.CLOUDFLARE_API_TOKEN, process.env.CLOUDFLARE_ACCOUNT_ID)
                }
            }
        }
    }
);

console.log("Server started at: " + url);