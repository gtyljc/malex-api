
// others
import * as types from "./types/index";
import { IncomingMessage } from "http";
import Cloudflare from "cloudflare";

// apollo server
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import schema from './schema';

// db
import { DatabaseSource } from "./sources";

const server = new ApolloServer<types.AppContext>({ schema });
const { url } = await startStandaloneServer(
    server,
    {
        listen: { port: parseInt(process.env.PORT) },
        context: async ({ req }: { req: IncomingMessage }) => {
            return {
                req,
                dataSources: {
                    db: new DatabaseSource(),
                    cloudflare: new Cloudflare(
                        { 
                            apiToken: process.env.CLOUDFLARE_API_TOKEN,
                            maxRetries: 3 
                        }
                    ),
                }
            }
        }
    }
);

console.log("Server started at: " + url);