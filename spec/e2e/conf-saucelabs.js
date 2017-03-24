require('coffee-script').register()

exports.config = {
  // ---- SauceLabs config
  sauceUser: 'sf-dahlia',
  sauceKey: ENV.SAUCE_KEY,
  // needs to use publicly accessible URL (or configure SauceConnect)
  baseUrl: 'http://dahlia-qa.herokuapp.com/',
  multiCapabilities: [
    // {
    //   browserName: 'internet explorer',
    //   version: '11',
    // },
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
    {
      browserName: 'iPhone'
    },
    // {
    //   browserName: 'iPad'
    // },
    // {
    //   browserName: 'android'
    // },
  ],
  // ----

  // might need to set these timeouts higher e.g. for iPhone simulator which takes a while to boot up
  getPageTimeout: 20000,
  allScriptsTimeout: 20000,
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  // path relative to the current config file
  specs: [ 'features/*.feature' ],
  cucumberOpts: {
    require: [
      'env.coffee',
      'step_definitions/*.coffee'
    ],
    tags: false,
    format: 'pretty',
    profile: false,
    'no-source': true
  }
}
