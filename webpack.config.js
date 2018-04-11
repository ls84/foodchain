const path = require('path')
const fs = require('fs')
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
    https: {
      key: fs.readFileSync('./cert/localhost.key'),
      cert: fs.readFileSync('./cert/localhost.crt'),
      ca: fs.readFileSync('./cert/localhost.crt')
    }
  },
  watch: true,
  mode: 'development'
}

module.exports = config;
