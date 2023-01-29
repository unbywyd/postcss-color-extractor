const path = require('path');
const plugin = require('./output/index.js');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        index: './test/index.js'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].min.css",
            chunkFilename: "[id].min.css",
            ignoreOrder: false,
        })
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                [
                                    "@babel/preset-env",
                                    {
                                        targets: {
                                            browsers: ["last 2 versions"],
                                        },
                                        debug: false,
                                    },
                                ]
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: "css-loader",
                        options: {
                            url: false,
                            import: false,
                        },
                    },
                    {
                        loader: "sass-loader",
                        options: {
                            additionalData: plugin()
                        }
                    },
                ]
            }
        ],
    },
    resolve: {
        modules: [path.resolve(__dirname, "node_modules"), path.resolve(__dirname, "test")],
    },
    output: {
        filename: "[name].min.js",
        path: path.resolve(__dirname, "test/dist"),
        publicPath: '/'
    },
    devServer: {
        static: [
            {
                directory: path.join(__dirname, 'test'),
                serveIndex: true,
                watch: true,
            }
        ],
        compress: true,
        liveReload: true,
        port: 9002,
        host: '127.0.0.1'
    },

};