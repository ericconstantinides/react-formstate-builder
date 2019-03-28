const path = require('path')
const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')

module.exports = function (config = {}) {
  return {
    mode: 'development',
    entry: ['./src/index.js', 'whatwg-fetch', './src/login.js'],
    output: {
      publicPath: '/',
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[hash].js',
      chunkFilename: '[name].[hash].js'
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.css']
    },
    devtool: 'source-map',
    // devtool: 'cheap-module-source-map',
    devServer: {
      overlay: true,
      historyApiFallback: true
    },
    module: {
      rules: [
        {
          // look for any css files that end in .variables.css and run the postcss-variables-loader:
          test: /\.css$/,
          include: [path.resolve(__dirname, './src/global-variables')],
          use: [{ loader: 'babel-loader' }, { loader: 'postcss-variables-loader' }]
        },
        {
          test: /\.js$/,
          exclude: path.resolve(__dirname, './node_modules/react-livechat'),
          use: [
            {
              loader: 'babel-loader'
            }
          ]
        },
        {
          test: /\.css$/,
          // do not process the *.variables.css files:
          exclude: [path.resolve(__dirname, './src/global-variables')],
          use: [
            'css-hot-loader',
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: '[name]_[local]',
                sourceMap: true
              }
            },
            {
              loader: 'postcss-loader'
            }
          ]
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'html-loader'
            }
          ]
        }
      ]
    },
    plugins: [
      new CopyWebpackPlugin([
        { from: 'src/config', to: 'config' },
      ]),
      new HtmlWebpackPlugin({
        template: 'public/index.html',
        chunksSortMode: 'none'
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: '[name].css'
      }),
      new CaseSensitivePathsPlugin()
    ]
  }
}
