
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// path to file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typesArray = loadFilesSync(`${__dirname}/schemas/**/*.graphql`);
const resolversArray = loadFilesSync(
    [
        `${__dirname}/resolvers/**/*.js`,
        `!${__dirname}/resolvers/base.js`, // exclude base.js from search pool
    ]
);

export default {
    typeDefs: mergeTypeDefs(typesArray),
    resolvers: mergeResolvers(resolversArray)
}