const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    main: path.resolve(__dirname, 'src/app.js')
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    assetModuleFilename: '[name][ext]',
    clean: true
  },
  devtool: 'source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 5000,
    open: true,
    hot: true,
  },
  module: {
    rules: [
      { test: /\.(glb|exr|jpg|png|svg|ico|webp|jpeg|gif)$/, type: 'asset/resource' },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'SkyCrayon Demo Flight',
      filename: 'index.html',
      template: path.resolve(__dirname, 'src/template.html')
    })
  ]
}