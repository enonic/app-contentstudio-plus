const ErrorLoggerPlugin = require('error-logger-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const ProvidePlugin = require('webpack/lib/ProvidePlugin');
const TerserPlugin = require('terser-webpack-plugin');

const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

const assets = path.join(__dirname, '/build/resources/main/assets');

module.exports = {
    context: path.join(__dirname, '/src/main/resources/assets'),
    entry: {
        'js/archive': './js/archive.ts',
        'js/main': './js/main.ts',
        'styles/main': './styles/main.less',
        'js/widgets/layers': './js/widgets/layers/main.ts',
        'js/widgets/variants': './js/widgets/variants/main.ts',
        'js/widgets/adobe': './js/widgets/adobe/main.ts',
        'styles/widgets/layers': './styles/widgets/layers/main.less',
        'styles/widgets/variants': './styles/widgets/variants/main.less',
        'styles/widgets/adobe': './styles/widgets/adobe/index.less',
        'styles/license': './styles/license.less'
    },
    output: {
        path: assets,
        filename: './[name].js',
        assetModuleFilename: './[file]'
    },
    resolve: {
        extensions: ['.ts', '.js', '.less', '.css']
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{loader: 'ts-loader', options: {configFile: 'tsconfig.json'}}]
            },
            {
                test: /\.less$/,
                use: [
                    {loader: MiniCssExtractPlugin.loader, options: {publicPath: '../'}},
                    {loader: 'css-loader', options: {sourceMap: !isProd, importLoaders: 1}},
                    {loader: 'postcss-loader', options: {sourceMap: !isProd}},
                    {loader: 'less-loader', options: {sourceMap: !isProd}},
                ]
            },
            {
                test: /\.(eot|woff|woff2|ttf)$|icomoon-studio-plus.svg/,
                use: 'file-loader?name=styles/icons/fonts/[name].[ext]'
            }
        ]
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    compress: {
                        drop_console: false
                    },
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
