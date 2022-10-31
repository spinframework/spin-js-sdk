const path = require('path');

module.exports = {
    entry: './sdk.ts',
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
        path: path.resolve(__dirname, '../../'),
        filename: 'sdk.js',
        libraryTarget: 'this'
    },
    optimization: {
        minimize: false
    },
};
