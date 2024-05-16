const path = require('path');
const SpinSDKPlugin = require("@fermyon/spin-sdk/plugins/webpack");

module.exports = {
    entry: './spin.ts',
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
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        path: path.resolve(__dirname, '.output'),
        filename: 'spin.js',
        module: true,
        library: {
            type: "module",
        }
    },
    optimization: {
        minimize: false
    },
    plugins: [
        new SpinSDKPlugin()
    ]
};
