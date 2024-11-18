// Common configuration applying to client and server configuration

// const { globalMutableWebpackConfig: baseClientWebpackConfig, merge } = require('shakapacker')
const { generateWebpackConfig, merge } = require("shakapacker")
const sass = require("./loaders/sass")
const babel = require("./loaders/babel")
const webpack = require("webpack")
const dotenv = require("dotenv")

const dotenvFiles = [".env"]
dotenvFiles.forEach((dotenvFile) => {
  dotenv.config({ path: dotenvFile, silent: true })
})

const commonOptions = {
  resolve: {
    extensions: [".css", ".ts", ".tsx", ".scss"],
  },
  module: {
    rules: [sass, babel],
  },
}

const generatedWebpackConfig = generateWebpackConfig()
const scssConfigIndex = generatedWebpackConfig.module.rules.findIndex((config) =>
  ".scss".match(config.test)
)
generatedWebpackConfig.module.rules.splice(scssConfigIndex, 1)

generatedWebpackConfig.plugins.unshift(
  new webpack.DefinePlugin({
    "process.env": {
      COVID_UPDATE: JSON.stringify(process.env.COVID_UPDATE),
      GOOGLE_PLACES_KEY: JSON.stringify(process.env.GOOGLE_PLACES_KEY),
      TOP_MESSAGE: JSON.stringify(process.env.TOP_MESSAGE),
      TOP_MESSAGE_TYPE: JSON.stringify(process.env.TOP_MESSAGE_TYPE),
      TOP_MESSAGE_INVERTED: JSON.stringify(process.env.TOP_MESSAGE_INVERTED),
      GOOGLE_TAG_MANAGER_KEY: JSON.stringify(process.env.GOOGLE_TAG_MANAGER_KEY),
      UNLEASH_URL: JSON.stringify(process.env.UNLEASH_URL),
      UNLEASH_TOKEN: JSON.stringify(process.env.UNLEASH_TOKEN),
      UNLEASH_ENV: JSON.stringify(process.env.UNLEASH_ENV),
      FCFS_FORMASSEMBLY_URL: JSON.stringify(process.env.FCFS_FORMASSEMBLY_URL),
    },
  })
)

// Should the below error ever come back, you may enable the ignoreWarnings object and add it as a parameter in the merge function below.
// Justification: https://github.com/shakacode/react-webpack-rails-tutorial/pull/519
// const ignoreWarningsConfig = {
//   ignoreWarnings: [/Module not found: Error: Can't resolve 'react-dom\/client'/]
// }
const base = () => merge({}, generatedWebpackConfig, commonOptions)

module.exports = base
