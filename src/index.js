
// apollo server
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema.js';
import { resolvers } from './resolvers.js';

// db
import DatabaseSource from './data-sources.js';

const server = new ApolloServer({ typeDefs, resolvers });
const { url } = await startStandaloneServer(
    server,
    {
        listen: {port: 4000},
        context: async () => {
            return {
                dataSources: {
                    db: new DatabaseSource()
                }
            }
        }
    }
);

console.log("Server started at: " + url);