
import { makeExecutableSchema } from "@graphql-tools/schema";
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import directives from "./directives";

// path to file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typesArray = loadFilesSync(`${__dirname}/schemas/**/*.graphql`);
const resolversArray = loadFilesSync(
    [
        `${__dirname}/resolvers/**/*.ts`,
        `!${__dirname}/resolvers/base.ts`, // exclude base.ts from search pool
    ]
);
let endSchema = makeExecutableSchema(
    {
        typeDefs: mergeTypeDefs(typesArray),
        resolvers: mergeResolvers(resolversArray)
    }
);

// add directives to schema
for (let directiveFunc of directives){
    endSchema = directiveFunc(endSchema);
}

export default endSchema;