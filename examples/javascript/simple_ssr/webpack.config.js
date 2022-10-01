const path = require('path');

module.exports = {
    entry: './src/index.js',
    module: {
        rules: [
          {
            test: /\.(js|jsx)$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: { presets: ['@babel/env','@babel/preset-react'] }
          },
        ],
      },
      resolve: {
        extensions: ['*', '.js', '.jsx'],
      },
    output: {
        path: path.resolve(__dirname, 'dist/'),
        filename: 'spin.js',
        library: 'spin'
    },
    optimization: {
        minimize: false
    },
};