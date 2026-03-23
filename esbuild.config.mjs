
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const ctx = await esbuild.context(
    {
        entryPoints: [ 'src/index.ts' ],
        outdir: 'dist',
        bundle: true,
        platform: 'node',
        format: 'esm',
        target: [ 'node20' ],
        sourcemap: true,
        tsconfig: 'tsconfig.json',
        external: [],
    }
);

if (watch) {
    await ctx.watch();
    
    console.log('Watching...');
} else {
    await ctx.rebuild();
    
    await ctx.dispose();
    
    console.log('Build done');
}