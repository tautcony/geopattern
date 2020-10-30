const path = require("path");

const TerserPlugin = require("terser-webpack-plugin");
const WebpackBar = require("webpackbar");

module.exports = {
    target: "web",
    mode: "production",
    entry: path.join(__dirname, "..", "lib", "index"),
    output: {
        filename: "js/geopattern.min.js",
        path: path.resolve(__dirname, ".."),
        devtoolModuleFilenameTemplate: "[absolute-resource-path]",
    },
    node: {
        // Buffer: false,
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                enforce: "pre",
                use: [
                    "source-map-loader",
                    {
                        loader: "eslint-loader",
                        options: {
                            typeCheck: true,
                        },
                    },
                ],
            },
            {
                test: /.tsx?$/,
                use: [
                    "ts-loader",
                ],
                exclude: /node_modules/,
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            extractComments: true,
            terserOptions: {
                output: {
                    // eslint-disable-next-line camelcase
                    ascii_only: true,
                },
            },
        })],
    },
    plugins: [
        new WebpackBar(),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
};
