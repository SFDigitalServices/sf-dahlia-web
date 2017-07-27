var dotenv = require('dotenv')
var config = require('./conf-shared')

// Load the .env file unless we already have environmental variables
if (!process.env.SAUCE_KEY) {
  dotenv.config()
}

// ---- SauceLabs config
config.sauceUser = 'sf-dahlia'
config.sauceKey = process.env.SAUCE_KEY
// needs to use publicly accessible URL (or configure SauceConnect)
config.baseUrl = process.env.SAUCE_URL || 'https://dahlia-qa.herokuapp.com/'
config.multiCapabilities = [
  {
    browserName: 'internet explorer',
    platform: 'Windows 10',
    version: '11.103'
  }
  // {
  //   browserName: 'firefox',
  //   version: '50',
  //   platform: 'WINDOWS 2008'
  // },
  // {
  //   browserName: 'chrome',
  //   platform: 'MAC'
  // },
  // {
  //   browserName: 'safari',
  //   platform: 'MAC'
  // },
  // {
  //   browserName: 'iPhone'
  // },
  // {
  //   browserName: 'iPad'
  // },
  // {
  //   browserName: 'android'
  // },
]
// Set these higher since tests run more slowly through Sauce Labs
config.getPageTimeout = 60000
config.allScriptsTimeout = 60000

exports.config = config
