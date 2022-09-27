const path = require('path');

module.exports = {
    entry: './sdk.js',
    output: {
        path: path.resolve(__dirname, '../../'),
        filename: 'sdk.js',
        libraryTarget: 'this'
    },
    optimization: {
        minimize: false
    },
};
