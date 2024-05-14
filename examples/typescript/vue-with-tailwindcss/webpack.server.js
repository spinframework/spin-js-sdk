const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
    entry: './src/server.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'server.js',
        module: true,
        library: {
            type: "module",
        }
    },
    experiments: {
        outputModule: true,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
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
