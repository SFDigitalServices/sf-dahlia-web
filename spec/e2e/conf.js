require('coffee-script').register()

exports.config = {
  getPageTimeout: 20000,
  allScriptsTimeout: 20000,
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  capabilities: {
    'browserName': 'chrome'
  },
  baseUrl: 'http://localhost:3000/',
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
