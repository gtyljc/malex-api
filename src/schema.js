
import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// path to file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const typesArray = loadFilesSync(`${__dirname}/types/**/*.graphql`);

export default mergeTypeDefs(typesArray);