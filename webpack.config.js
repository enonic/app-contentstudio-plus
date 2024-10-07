const ErrorLoggerPlugin = require('error-logger-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const TerserPlugin = require('terser-webpack-plugin');

const path = require('path');
const fs = require('fs');
const isProd = process.env.NODE_ENV === 'production';
const assets = path.join(__dirname, '/build/resources/main/assets');

const swcConfig = JSON.parse(fs.readFileSync('./.swcrc'));

module.exports = {
    context: path.join(__dirname, '/src/main/resources/assets'),
    entry: {
        'js/archive': './js/archive.ts',
        'styles/main': './styles/main.less',
        'js/widgets/layers': './js/widgets/layers/main.ts',
        'js/widgets/variants': './js/widgets/variants/main.ts',
        'js/widgets/publish-report': './js/widgets/publish-report/main.ts',
        'styles/widgets/layers': './styles/widgets/layers/main.less',
        'styles/widgets/variants': './styles/widgets/variants/main.less',
        'styles/widgets/publish-report': './styles/widgets/publish-report/main.less',
        'styles/license': './styles/license.less'
    },
    output: {
        path: assets,
        filename: './[name].js'
    },
    resolve: {
        extensions: ['.ts', '.js', '.less', '.css']
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'swc-loader',
                        options: {
                            ...swcConfig,
                            sourceMaps: isProd ? false : 'inline',
                            inlineSourcesContent: !isProd,
                        },
                    },
                ],
            },
            {
                test: /\.less$/,
                use: [
                    {loader: MiniCssExtractPlugin.loader, options: {publicPath: '../'}},
                    {loader: 'css-loader', options: {sourceMap: !isProd, importLoaders: 1}},
                    {loader: 'postcss-loader', options: {sourceMap: !isProd}},
                    {loader: 'less-loader', options: {sourceMap: !isProd}},
                ]
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_classnames: true,
                    keep_fnames: true
                }
            })
        ]
    },
    plugins: [
        new ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: './styles/[id].css'
        }),
        new CircularDependencyPlugin({
            exclude: /a\.js|node_modules/,
            failOnError: true
        }),
        //new ErrorLoggerPlugin({showColumn: false}),
    ],
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'source-map',
    performance: { hints: false }
};
