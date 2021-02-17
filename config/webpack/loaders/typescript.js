// const PnpWebpackPlugin = require('pnp-webpack-plugin')

module.exports = {
  test: /\.(ts|tsx)?$/,
  use: [
      {
          loader: 'ts-loader'
      }
  ]
}
