
import * as esbuild from 'esbuild';
import pkg from './package.json' with { type: 'json' };
import { cp } from 'fs/promises';
import { join } from "node:path";

const DIST_PATH = "./dist";
const SCHEMAS_PATH = "./src/schemas";
const PRISMA_PATH = "./src/lib/prisma/generated";
// const RESOLVERS_PATH = "./src/resolvers";
const EXTERNALS = [
    
    // generated prisma client
    './prisma',

    // all packages from package.json
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
];
const watch = process.argv.includes('--watch');
const ctx = await esbuild.context(
    {
        entryPoints: [ './src/app.ts' ],
        outfile: join(DIST_PATH, 'app.js'),
        bundle: true,
        platform: 'node',
        format: "esm",
        tsconfig: "./tsconfig.json",
        alias: {
            "@lib/prisma": "./prisma"
        },
        external: [
            ...EXTERNALS,
            ...EXTERNALS.map((x) => `${x}/*`),
        ],
        // minify: true
    }
);

function copyFolderToDist(pathToFolder, newFolderPath) {
    cp(pathToFolder, join(DIST_PATH, newFolderPath), { recursive: true });
}

if (watch) {
    copyFolderToDist(SCHEMAS_PATH, "schemas");
    copyFolderToDist(PRISMA_PATH, "prisma/generated");
    // copyFolderToDist(RESOLVERS_PATH, "resolvers");

    await ctx.watch();

    console.log('Watching...');
} 
else {
    copyFolderToDist(SCHEMAS_PATH, "schemas");
    copyFolderToDist(PRISMA_PATH, "prisma/generated");
    // copyFolderToDist(RESOLVERS_PATH, "resolvers");

    await ctx.rebuild();

    await ctx.dispose();

    console.log('Build done');
}