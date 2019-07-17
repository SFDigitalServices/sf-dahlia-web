module.exports = {
  test: /\.slim$/,
  use: [{
    loader: 'slim-lang-loader',
    options: {
      slimOptions: {
        disable_escape: true
      }
    }
  }]
}
