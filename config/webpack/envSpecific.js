const base = require('./base')

const webpackConfig = (envSpecific) => {
  const clientConfig = base()

  if (envSpecific) {
    envSpecific(clientConfig)
  }

  return clientConfig
}

module.exports = webpackConfig
