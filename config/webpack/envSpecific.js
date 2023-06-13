const commonWebpackConfig = require('./base')

const webpackConfig = (envSpecific) => {
  const clientConfig = commonWebpackConfig()

  if (envSpecific) {
    envSpecific(clientConfig)
  }

  let result = clientConfig
  return result
}

module.exports = webpackConfig