const bloomTheme = require("../../../tailwind.config.js")

// eslint-disable-next-line import/order
const tailwindVars = require("@bloom-housing/ui-components/tailwind.tosass.js")(bloomTheme)

module.exports = {
  test: /\.(scss|sass)$/,
  use: [
    // Creates `style` nodes from JS strings
    "style-loader",
    // Translates CSS into CommonJS
    "css-loader",
    // Various CSS pre and post-processors, including tailwind.
    // See postcss.config.js for specifics
    // This line must come after style/css loaders and before the sass loader
    "postcss-loader",
    // Compiles Sass to CSS
    {
      loader: "sass-loader",
      options: {
        additionalData: tailwindVars
      }
    }
  ]
}
