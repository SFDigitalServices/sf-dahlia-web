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
  },
  onPrepare: function() {
    // console.log('PREPARE')
    // browser.driver.executeScript('window.protractor = true');
    // browser.executeScript(function() {
    //   console.log('PREPARE')
    //   window.protractor = true
    // });
    browser.driver.get('http://localhost:3000/get-assistance');
  },
}
