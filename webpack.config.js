const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';

const JS_DIR = path.resolve(__dirname, 'src/js');
const IMG_DIR = path.resolve(__dirname, 'src/img');
const LIB_DIR = path.resolve(__dirname, 'src/library');
const BUILD_DIR = path.resolve(__dirname, 'build');
const SRC_DIR = path.resolve(__dirname, 'src');

module.exports = {
  entry: {
    public       : JS_DIR + '/public.js',
    admin        : JS_DIR + '/admin.js',
    task          : JS_DIR + '/task.js',
    pwa          : JS_DIR + '/pwa.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    // filename: isDev ? '[name].js' : '[name].[contenthash].js',
    // publicPath: '/',
    publicPath: '/wp-content/plugins/partnership-manager/assets/dist/',
    clean: true,

    // path: BUILD_DIR,
    filename: 'js/[name].js'
  },
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'source-map' : false,
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@components': path.resolve(__dirname, 'src/js/backend/app/components'),
      '@context': path.resolve(__dirname, 'src/js/backend/app/components/context'),
      '@sass': path.resolve(__dirname, 'src/sass'),
      '@img': path.resolve(__dirname, 'src/img'),
      '@js': path.resolve(__dirname, 'src/js'),
    },
  },
  devServer: {
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, 'dist'),
    },
    port: 3000,
    open: true
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          // isDev && require.resolve('react-refresh/babel'),
          {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', { targets: 'defaults' }],
                ['@babel/preset-react', { runtime: 'automatic' }],
              ],
              plugins: [
                '@babel/plugin-syntax-dynamic-import',
                isDev && require.resolve('react-refresh/babel')
              ].filter(Boolean),
            },
          },
        ].filter(Boolean),
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'images/[hash][ext][query]',
        },
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[hash][ext][query]',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    // new HtmlWebpackPlugin({
    //   template: './src/js/backend/app/index.html',
    //   favicon: './src/img/brand/favicon.ico',
    // }),
    !isDev && new MiniCssExtractPlugin({
      // filename: '[name].[contenthash].css',
      filename: 'css/[name].css',
    }),
    isDev && new ReactRefreshWebpackPlugin(),
    !isDev && new WorkboxPlugin.InjectManifest({
      swSrc: JS_DIR + '/sw.js',
      // swSrc: './src/js/sw.js',
      swDest: 'js/sw.js',
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    }),
    new CopyPlugin({
      patterns: [
        { from: LIB_DIR, to: path.resolve(__dirname, 'dist/library') },
        { from: path.resolve(SRC_DIR, 'icons'), to: path.resolve(__dirname, 'dist/icons') },
      ],
    })
  ].filter(Boolean),
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: 'single',
  },
  // performance: {
  //   hints: isDev ? false : 'warning',
  //   maxEntrypointSize: 512000, // 500 KB
  //   maxAssetSize: 512000,
  // },
  // watchOptions: {
  //   aggregateTimeout: 300,
  //   poll: 1000,
  //   ignored: /node_modules|build/,
  // },
};
