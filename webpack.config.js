const path = require('path')
const config = {
  entry: [
  './index.js'
  ],
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, './build')
  },
  devServer: {
    contentBase: path.join(__dirname, './dist'),
    host: '0.0.0.0',
    port: 8000,
  },
  watch: true,
  mode: 'development'
}

module.exports = config;
