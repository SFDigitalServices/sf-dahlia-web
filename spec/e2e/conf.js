require('coffee-script').register()
var projectDir = process.cwd()

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
  specs: [ './features/short_form/live_work.feature' ],
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
