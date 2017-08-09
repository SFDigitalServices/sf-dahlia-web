require('coffee-script').register()
var projectDir = process.cwd()

module.exports = {
  getPageTimeout: 30000,
  allScriptsTimeout: 30000,
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  // path relative to the current config file
  specs: [ './features/**/submitting_application.feature' ],
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
    // Let Angular know we're using protractor and turn off onunload alerts
    browser.addMockModule('dahlia.protractorContext', function() {
      angular
        .module('dahlia.protractorContext', [])
        .run([function(){
          window.protractor = true
        }])
    })
  }
}
