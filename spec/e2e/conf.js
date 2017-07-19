var config = require('./conf-shared')

config.baseUrl = 'http://localhost:3000/'
config.capabilities = {
  'browserName': 'chrome'
}

exports.config = config
