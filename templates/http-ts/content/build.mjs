// build.mjs
import { build } from 'esbuild';
import { SpinEsbuildPlugin } from "@spinframework/build-tools/plugins/esbuild";

const debug = process.argv.includes('--debug');

await build({
    entryPoints: ['./src/index.ts'],
    outfile: './build/bundle.js',
    bundle: true,
    format: 'esm',
    platform: 'browser',
    sourcemap: true,
    minify: false,
    loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
    },
    resolveExtensions: ['.ts', '.tsx', '.js'],
    plugins: [await SpinEsbuildPlugin({
        componentize: {
            debug,
            output: './dist/{{project-name | kebab_case}}.wasm',
            initLocation: 'http://test-deps.localhost',
        }
    })],
});
