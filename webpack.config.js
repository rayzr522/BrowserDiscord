const webpack = require('webpack');

module.exports = {
    entry: {
        main: './src/index.js'
    },
    devtool: 'source-map',
    output: {
        filename: '[name].js'
    }
};