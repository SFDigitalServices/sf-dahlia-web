module.exports = {
  test: [/\.jsx?$/, /\.tsx?$/],
  use: [
    {
      loader: 'babel-loader',
      options:
      {
        presets: [
            ['@babel/preset-env', {loose: true, modules: false}],
            '@babel/react',
            '@babel/typescript'
        ],
        sourceType: 'unambiguous'
      }
    }
  ]
}
