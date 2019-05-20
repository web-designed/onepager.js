const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = (env) => {

   const isProduction = env === 'production' ? true : false;
   const isDev = env === 'development' ? true : false;

   return {
      entry: {
         onepager: './src/js/onepager.js',
         demo: './src/js/demo.js'
      },
      output: {
         path: path.join(__dirname, 'dist/js'),
         filename: '[name].min.js',
         library: 'onepager.js',
         libraryTarget: 'umd',
         umdNamedDefine: true
      },
      module: {
         rules: [{
            test: /\.(js|jsx)$/,
            exclude: /(node_modules)/,
            loader: 'babel-loader',
            query: {
               presets: ['es2015'],
               plugins: ['babel-plugin-add-module-exports'],
            },
         },{
            test:/\.scss$/,
            use: ExtractTextPlugin.extract({
               use: [
                  {
                     loader: 'css-loader',
                     options: {
                        minimize: true,
                        sourceMap: true
                     }
                  }, 
                  {
                     loader: "postcss-loader",
                     options: {
                        sourceMap: true
                     }
                  },
                  {
                     loader:'sass-loader',
                     options: {
                        sourceMap: true
                     }
                  }
               ]
            })
         },]
      },
      plugins: [
         new webpack.optimize.UglifyJsPlugin({
            minimize: true,
         }),
         new ExtractTextPlugin({
            filename: (getPath) => {
               console.log(getPath('[name]'))
               const fileName = getPath('[name]')
               const targetPath = fileName === 'demo' ? `../../demo/assets/css/${fileName}.min.css` : `../css/${fileName}.min.css`
               return targetPath
            },
            allChunks: true
         }),
         new FileManagerPlugin({
            onStart: {
               // delete: [
               //    "./demo/assets/js",
               // ],
               // mkdir: [
               //    "./demo/assets/js",
               // ]
            },
            onEnd: {
               copy: [
                  { source: './dist/js/demo.min.js', destination: './demo/assets/js/demo.min.js' }
               ]
            }
         })
      ],
      devtool: isProduction ? 'source-map' : 'inline-source-map',
   }
};
