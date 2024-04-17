const path = require('path');
const fs = require('fs');

let directoryPath = path.join(__dirname, 'build')
const tempFilename = path.join(__dirname, `build/add-export-loader.js`);
if (!fs.existsSync(directoryPath)) {
    try {
        fs.mkdirSync(directoryPath, { recursive: true });
    } catch (err) {
        console.error('Error creating directory:', err);
    }
}
const content = `
module.exports = function (content) {
    if (content.includes('export const handleRequest ')) {
        return \`import {incomingHandler} from \"@fermyon/spin-sdk\"\n\${content}\nincomingHandler.handleRequest = handleRequest\nexport { incomingHandler };\`;
    }
    return content;
};`;
fs.writeFileSync(tempFilename, content);

module.exports = {
    entry: './src/index.ts',
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{ loader: 'ts-loader' },
                { loader: tempFilename }
                ],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, './'),
        filename: 'dist.js',
        module: true,
        library: {
            type: "module",
        }
    },
    externals: {
        "wasi:http/types@0.2.0": "wasi:http/types@0.2.0",
        "fermyon:spin/llm@2.0.0": "fermyon:spin/llm@2.0.0",
        "fermyon:spin/variables@2.0.0": "fermyon:spin/variables@2.0.0",
        "fermyon:spin/redis@2.0.0": "fermyon:spin/redis@2.0.0",
        "fermyon:spin/key-value@2.0.0": "fermyon:spin/key-value@2.0.0",
        "fermyon:spin/sqlite@2.0.0": "fermyon:spin/sqlite@2.0.0",
        "fermyon:spin/postgres@2.0.0": "fermyon:spin/postgres@2.0.0",
        "fermyon:spin/mysql@2.0.0": "fermyon:spin/mysql@2.0.0",
        "fermyon:spin/mqtt@2.0.0": "fermyon:spin/mqtt@2.0.0"

    },
    optimization: {
        minimize: false
    },
};