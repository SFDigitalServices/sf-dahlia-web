const { environment } = require("@rails/webpacker")
const dotenv = require("dotenv")
const webpack = require("webpack")

const dotenvFiles = [".env"]
dotenvFiles.forEach((dotenvFile) => {
  dotenv.config({ path: dotenvFile, silent: true })
})

// Strings needs to be interpolated and single quoted
const parseStringEnv = (value) => (value ? `'${value}'` : null)

environment.plugins.prepend(
  "Environment",
  new webpack.DefinePlugin({
    "process.env": {
      TOP_MESSAGE: parseStringEnv(process.env.TOP_MESSAGE),
      TOP_MESSAGE_TYPE: parseStringEnv(process.env.TOP_MESSAGE_TYPE),
      SHOW_RESEARCH_BANNER: process.env.SHOW_RESEARCH_BANNER,
      RESEARCH_FORM_URL: parseStringEnv(process.env.RESEARCH_FORM_URL),
    },
  })
)

const babel = require("./loaders/babel")
const sass = require("./loaders/sass")
environment.loaders.prepend("babel", babel)
environment.loaders.append("sass", sass)

environment.loaders.keys().forEach((loaderName) => {
  const loader = environment.loaders.get(loaderName)
  loader.use.forEach((loaderConfig) => {
    if (loaderConfig.options && loaderConfig.options.config) {
      loaderConfig.options.postcssOptions = loaderConfig.options.config
      delete loaderConfig.options.config
    }
  })
})

module.exports = environment
