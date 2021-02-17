module.exports = {
  test: /\.js$/,
  use:
    {
      loader: 'babel-loader',
      options:
      {
        presets: [
            ['@babel/preset-env', {loose: true, modules: false}],
            '@babel/react'
        ],
        sourceType: 'unambiguous'
      }
    }
}
