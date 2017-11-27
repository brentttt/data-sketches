const path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: ['./src/app.js', './src/style/style.scss'],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'public')
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
      }, {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: 'css-loader?importLoaders=1'
        })
      }, {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['react', 'env', 'stage-2']
        }
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({
      filename: 'style/style.css',
      allChunks: true
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, 'public')
  },
}
