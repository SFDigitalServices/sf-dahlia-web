// Common configuration applying to client and server configuration
const { webpackConfig: baseClientWebpackConfig, merge } = require("shakapacker")
const dotenv = require("dotenv")
const webpack = require("webpack")
const path = require("path")

const dotenvFiles = [".env"]
dotenvFiles.forEach((dotenvFile) => {
  dotenv.config({ path: dotenvFile, silent: true })
})

const babel = require("./loaders/babel")
const sass = require("./loaders/sass")
const commonOptions = {
  target: "web",
  // devtool: 'inline-source-map',
  resolve: {
    extensions: [ '.tsx','.ts','.js','.css',],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        COVID_UPDATE: JSON.stringify(process.env.COVID_UPDATE),
        DIRECTORY_PAGE_REACT: JSON.stringify(process.env.DIRECTORY_PAGE_REACT),
        GOOGLE_PLACES_KEY: JSON.stringify(process.env.GOOGLE_PLACES_KEY),
        RESEARCH_FORM_URL: JSON.stringify(process.env.RESEARCH_FORM_URL),
        SHOW_RESEARCH_BANNER: process.env.SHOW_RESEARCH_BANNER,
        SRO_PLURAL_LISTINGS: process.env.SRO_PLURAL_LISTINGS,
        TOP_MESSAGE: JSON.stringify(process.env.TOP_MESSAGE),
        TOP_MESSAGE_TYPE: JSON.stringify(process.env.TOP_MESSAGE_TYPE),
        TOP_MESSAGE_INVERTED: JSON.stringify(process.env.TOP_MESSAGE_INVERTED),
      },
    }),
  ],
  module: {
    rules: [babel, sass, { loader: "file-loader" }],
  },
}

// https://github.com/webpack-contrib/sass-loader/issues/867#issuecomment-791556705
const scssConfigIndex = baseClientWebpackConfig.module.rules.findIndex((config) => {
  return ".scss".match(config.test)
})
baseClientWebpackConfig.module.rules.splice(scssConfigIndex, 1)

// const scssConfigIndex = baseClientWebpackConfig.module.rules.findIndex((config) => {
//   return ".scss".match(config.test)
// })
// baseClientWebpackConfig.module.rules = []

// const ignoreWarningsConfig = {
//   ignoreWarnings: [/Module not found: Error: Can't resolve 'react-dom\/client'/],
// };
// Copy the object using merge b/c the baseClientWebpackConfig and commonOptions are mutable globals
const commonWebpackConfig = () => merge({}, baseClientWebpackConfig, commonOptions)
// const commonWebpackConfig = () => (merge({}, generateWebpackConfig(), commonOptions, ignoreWarningsConfig))

module.exports = commonWebpackConfig
