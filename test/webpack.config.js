'use strict'

const path = require('path')
const webpack = require('webpack')
const glob = require('glob')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SSICompileWebpackplugin = require('../index.js')

const ENTRY = path.resolve(__dirname, '../test');
const OUTPUT = path.resolve(__dirname, '../test/release');

const htmlArr = () => {
    const html = glob.sync('./test/*.html')
    let array = []
    if(html.length > 0){
        html.forEach((item, index, arr) => {
            array.push(new HtmlWebpackPlugin({
                filename: `${path.basename(item)}`,
                template: item,
                inject: true
            }))
        })
    }
    return array
}




module.exports = {
    entry: `${ENTRY}/entry.js`,
    output: {
        path: `${OUTPUT}`,
        filename: `[name].js`
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
                options: {
                    minimize: false,
                }
            }
        ]
    },
    devtool: 'source-map',
    plugins: [
        ...htmlArr(),
        new SSICompileWebpackplugin({
            localBaseDir: path.resolve(__dirname, '..'),
            publicPath: ''
        })
    ],
}
