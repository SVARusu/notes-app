var HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: {
    app: './js/app.ts',
    login: './js/index.ts',
    register: './js/registerpage.ts',
    notes: './js/notespage.ts',
    db: './js/db.ts'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    filename: '[name].bundle.js'
  },
  devServer: {
    inline: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: true,
      template: './index.html',
      chunks: ['login', 'db'],
      filename: './index.html' //relative to root of the application
    }),
    new HtmlWebpackPlugin({
      hash: true,

      template: './register.html',
      chunks: ['register', 'db'],
      filename: './register.html'
    }),
    new HtmlWebpackPlugin({
      hash: true,

      template: './notes.html',
      chunks: ['notes', 'db'],
      filename: './notes.html'
    })
  ]
};
