// build.mjs
import { build } from 'esbuild';
import path from 'path';
import { SpinEsbuildPlugin } from "@spinframework/build-tools/plugins/esbuild/index.js";
import fs from 'fs';

const spinPlugin = await SpinEsbuildPlugin();

// plugin to handle vendor files in node_modules that may not be bundled.
// Instead of generating a real source map for these files, it appends a minimal
// inline source map pointing to an empty source. This avoids errors and ensures
// source maps exist even for unbundled vendor code.
let SourceMapPlugin = {
    name: 'excludeVendorFromSourceMap',
    setup(build) {
        build.onLoad({ filter: /node_modules/ }, args => {
            return {
                contents: fs.readFileSync(args.path, 'utf8')
                    + '\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiJdLCJtYXBwaW5ncyI6IkEifQ==',
                loader: 'default',
            }
        })
    },
}

await build({
    entryPoints: ['./src/index.ts'],
    outfile: './build/bundle.js',
    bundle: true,
    format: 'esm',
    platform: 'node',
    sourcemap: true,
    minify: false,
    plugins: [spinPlugin, SourceMapPlugin],
    logLevel: 'error',
    loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
    },
    resolveExtensions: ['.ts', '.tsx', '.js'],
    sourceRoot: path.resolve(process.cwd(), 'src'),
});
