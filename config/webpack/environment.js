const { environment } = require("@rails/webpacker")
const CssnanoPlugin = require("cssnano-webpack-plugin")
const dotenv = require("dotenv")
const webpack = require("webpack")

const dotenvFiles = [".env"]
dotenvFiles.forEach((dotenvFile) => {
  dotenv.config({ path: dotenvFile, silent: true })
})

environment.plugins.prepend(
  "Environment",
  new webpack.DefinePlugin({
    "process.env": {},
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

environment.plugins.append("CssnanoPlugin", new CssnanoPlugin())

environment.config.set("optimization", {
  minimize: true,
})

module.exports = environment
