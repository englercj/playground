/* eslint-env node */
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { NoEmitOnErrorsPlugin, DefinePlugin } = require('webpack');

const ASSET_PATH = 'assets';
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
    mode: devMode ? 'development' : 'production',
    devtool: 'source-map',
    recordsPath: path.join(__dirname, '.records'),
    entry: {
        index: './src/index.ts',
        results: './src/results.ts',
    },
    output: {
        path: path.join(__dirname, 'dist'),
        publicPath: '/',
        filename: `${ASSET_PATH}/[name].[hash].js`,
        chunkFilename: `${ASSET_PATH}/[id].[hash].js`,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: [
                    path.resolve(__dirname, 'node_modules/monaco-editor/monaco.d.ts'),
                    path.resolve(__dirname, 'node_modules/preact-router/dist/index.d.ts'),
                    path.resolve(__dirname, '../typings'),
                    path.resolve(__dirname, 'typings'),
                    path.resolve(__dirname, 'src'),
                ],
                use: [
                    {
                        loader: 'ts-loader',
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|svg|gif|ttf|woff2?|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: `${ASSET_PATH}/[hash].[ext]`,
                        },
                    },
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            bypassOnDebug: true,
                            optipng: { optimizationLevel: 7 },
                            gifsicle: { interlaced: false },
                        },
                    },
                ],
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    // 'postcss-loader',
                    'less-loader',
                ],
            },
        ],
    },
    plugins: [
        // don't emit output when there are errors
        new NoEmitOnErrorsPlugin(),

        // extract inline css into separate 'styles.css'
        new MiniCssExtractPlugin({
            filename: `${ASSET_PATH}/[name].[hash].css`,
            chunkFilename: `${ASSET_PATH}/[id].[hash].css`,
        }),

        // create marketing html
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: './html/index.ejs',
            title: 'Pixi Playground',
            description: 'Create and view demos using pixi.js.',
            url: 'http://pixiplayground.com',
            cache: true,
            chunks: ['index'],
        }),

        // create marketing html
        new HtmlWebpackPlugin({
            filename: 'results.html',
            template: './html/results.ejs',
            title: 'Pixi Playground Results',
            description: 'Pixi Playground Results',
            url: 'http://pixiplayground.com',
            cache: true,
            chunks: ['results'],
        }),

        // copy some static assets favicon stuff
        new CopyWebpackPlugin([
            {
                from: './html/favicons/*',
                flatten: true,
            },
            {
                from: 'node_modules/monaco-editor/min/vs',
                to: 'vs',
            },
        ]),

        // add some extra defines
        new DefinePlugin({
            __BASE_ORIGIN__: JSON.stringify(process.argv.find(v => v.includes('webpack-dev-server')) ? 'http://localhost:3000' : ''),
        }),
    ],
};
