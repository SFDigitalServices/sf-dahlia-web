// Below code should get refactored but the current way that rails/webpacker v5
// does the globals, it's tricky
const webpackConfig = require('./envSpecific')

const productionEnvOnly = (clientWebpackConfig) => {
  // place any code here that is for production only
  clientWebpackConfig.devtool = false
}

module.exports = webpackConfig(productionEnvOnly)
