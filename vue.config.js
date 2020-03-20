const CompressionWebpackPlugin  = require('compression-webpack-plugin');

module.exports = {
  productionSourceMap: false,
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
    plugins: [
      new CompressionWebpackPlugin({
        cache: false,
        algorithm: 'gzip',
        deleteOriginalAssets: true,
      }),
    ],
    output:{
      filename: '[name].[hash:4].js',
      chunkFilename: '[name].[hash:4].js'
    },
    optimization: {
      splitChunks: false
    }
  },
  // outputDir: process.env.NODE_ENV === 'production'
  //   ? '../../data'
  //   : 'dist',
  css: {
    extract: false,
  },
}