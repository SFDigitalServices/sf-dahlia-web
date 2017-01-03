require('coffee-script').register()
require('dotenv').config()

var baseUrl = 'https://dahlia-qa.herokuapp.com'

if (process.env.PULL_REQUEST_NUMBER) {
  baseUrl = 'https://dahlia-qa-' + process.env.PULL_REQUEST_NUMBER + '.herokuapp.com'
}

exports.config = {
 sauceUser: process.env.SAUCE_USERNAME,
 sauceKey: process.env.SAUCE_ACCESS_KEY,
 framework: 'jasmine',
 baseUrl: baseUrl,
 specs: [ 'short-form.coffee' ],
}
