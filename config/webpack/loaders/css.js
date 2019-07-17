module.exports = {
  test: /\.(sass|scss|svg|png|jpe?g)$/,
  use: [
    // "style-loader", // creates style nodes from JS strings
    // "css-loader", // translates CSS into CommonJS
    // "sass-loader" // compiles Sass to CSS, using Node Sass by default

    {
      loader: 'css-loader',
      options: {
        importLoaders: 1,
        minimize: true,
        sourceMap: true
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: true
      }
    },
    {
      loader: "resolve-url-loader", //resolve-url-loader needs to come *BEFORE* sass-loader
      options: {
        sourceMap: true
      }
    },
    {
      loader: "sass-loader",
      options: {
        sourceMap: true
      }
    }
  ]
}
