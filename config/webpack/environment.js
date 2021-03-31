const { environment } = require("@rails/webpacker")

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
