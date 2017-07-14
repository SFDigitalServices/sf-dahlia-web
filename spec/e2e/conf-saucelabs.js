require('dotenv').config()
require('coffee-script').register()
var projectDir = process.cwd()

exports.config = {
  // ---- SauceLabs config
  sauceUser: 'sf-dahlia',
  sauceKey: process.env.SAUCE_KEY,
  // needs to use publicly accessible URL (or configure SauceConnect)
  baseUrl: process.env.TEST_URL,
  multiCapabilities: [
    {
      browserName: 'internet explorer',
      platform: 'Windows 10',
      version: '11.103',
    },
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
  ],
  // ----

  // might need to set these timeouts higher e.g. for iPhone simulator which takes a while to boot up
  getPageTimeout: 30000,
  allScriptsTimeout: 30000,
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  // path relative to the current config file
  specs: [ './features/**/*.feature' ],
  cucumberOpts: {
    require: [
      projectDir + '/spec/e2e/env.coffee',
      projectDir + '/spec/e2e/step_definitions/**/*.coffee'
    ],
    tags: false,
    format: 'pretty',
    profile: false,
    'no-source': true
  }
}
