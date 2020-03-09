const CompressionWebpackPlugin  = require('compression-webpack-plugin');

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
  //   plugins: process.env.NODE_ENV === 'production' 
  //     ? []
  //     : [
  //     new CompressionWebpackPlugin({
  //       cache: false,
  //       algorithm: 'gzip',
  //       deleteOriginalAssets: true,
  //     }),
  //   ],
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
  // productionSourceMap: process.env.NODE_ENV !== 'production' ,
  css: {
    extract: false,
  },
}