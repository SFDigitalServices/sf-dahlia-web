const { environment } = require("@rails/webpacker")
const dotenv = require("dotenv")
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin")
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

environment.plugins.append("OptimizeCssAssetsPlugin", new OptimizeCssAssetsPlugin())

environment.config.set("optimization", {
  minimizer: [
    new OptimizeCssAssetsPlugin({
      cssProcessorOptions: {
        safe: true,
        discardComments: {
          removeAll: true,
        },
      },
    }),
  ],
})

module.exports = environment
