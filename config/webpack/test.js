const webpackConfig = require('./envSpecific')

const testOnly = (_clientWebpackConfig) => {
  // place any code here that is for test only
}

module.exports = webpackConfig(testOnly)
