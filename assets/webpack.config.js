const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const cssnano = 'cssnano';
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const SRC_DIR = path.resolve(__dirname, 'src');
const JS_DIR = path.resolve(__dirname, 'src/js');
const IMG_DIR = path.resolve(__dirname, 'src/img');
const BUILD_DIR = path.resolve(__dirname, 'build');
const LIB_DIR = path.resolve(__dirname, 'src/library');

const entry = {
    public: JS_DIR + '/public.js',
    admin: JS_DIR + '/admin.js',
    pwa: JS_DIR + '/pwa.js',
};

const output = {
    path: BUILD_DIR,
    filename: 'js/[name].js',
    publicPath: '/',
};

const plugins = (argv) => [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
        filename: 'css/[name].css',
    }),
];

const rules = [
    {
        test: /\.m?js$/,
        include: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                presets: [
                    ['@babel/preset-env', {
                        targets: {
                            esmodules: false,
                        },
                        useBuiltIns: 'usage',
                        corejs: 3,
                    }],
                    '@babel/preset-react',
                ],
                plugins: [
                    '@babel/plugin-transform-optional-chaining',
                    '@babel/plugin-proposal-nullish-coalescing-operator',
                    ['@babel/plugin-transform-runtime', {
                        corejs: 3,
                        helpers: true,
                        regenerator: true,
                        useESModules: false,
                    }],
                ],
            },
        },
    },
    {
        test: /\.jsx?$/,
        include: SRC_DIR,
        use: {
            loader: 'babel-loader',
            options: {
                presets: [
                    ['@babel/preset-env', {
                        targets: {
                            esmodules: false,
                        },
                        useBuiltIns: 'usage',
                        corejs: 3,
                    }],
                    '@babel/preset-react',
                ],
                plugins: [
                    '@babel/plugin-transform-optional-chaining',
                    '@babel/plugin-proposal-nullish-coalescing-operator',
                ],
            },
        },
    },
    {
        test: /\.s[ac]ss$/i,
        use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
        ],
    },
    {
        test: /\.(png|jpg|svg|jpeg|gif|ico)$/,
        use: {
            loader: 'file-loader',
            options: {
                name: '[path][name].[ext]',
                publicPath: '/',
            },
        },
    },
    {
        test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
        exclude: [SRC_DIR, /node_modules/],
        use: {
            loader: 'file-loader',
            options: {
                name: '[path][name].[ext]',
                publicPath: '/',
            },
        },
    },
];

module.exports = (env, argv) => ({
    mode: argv.mode || 'development',
    entry: entry,
    output: output,
    devtool: 'source-map',
    module: {
        rules: rules,
    },
    resolve: {
        extensions: ['.js', '.jsx', '.mjs'],
        modules: [
            'node_modules',
            path.resolve(__dirname, 'node_modules'),
        ],
        symlinks: false,
    },
    optimization: {
        minimizer: [
            new OptimizeCssAssetsPlugin({
                cssProcessor: cssnano,
            }),
            new TerserPlugin({
                parallel: true,
                sourceMap: argv.mode === 'development',
                extractComments: false,
                terserOptions: {
                    ecma: 6,
                    module: false,
                    toplevel: false,
                    output: {
                        comments: false,
                    },
                },
            }),
        ],
    },
    plugins: [
        ...plugins(argv),
    ],
    watchOptions: {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [/node_modules/, /build/, /C:\\/]
    },
    devServer: {
        contentBase: BUILD_DIR,
        historyApiFallback: true,
        compress: true,
        port: 3000,
        hot: true,
    },
});