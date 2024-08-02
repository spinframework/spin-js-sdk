const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const SpinSDKPlugin = require('@fermyon/spin-sdk/plugins/webpack');

module.exports = {
    entry: './src/client.ts', // Entry point for your application
    output: {
        filename: 'client.js', // Name of the output bundle
        path: path.resolve(__dirname, 'dist', 'static'), // Output directory
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.css$/i,
                include: path.resolve(__dirname, 'src'),
                use: ['style-loader', 'css-loader', 'postcss-loader'],
            },
        ],
    },
    plugins: [
        new VueLoaderPlugin(),
        new SpinSDKPlugin(),
    ],
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    optimization: {
        minimize: false
    },
};
