var config = require('./conf-shared')

config.baseUrl = 'http://localhost:3000/'
config.capabilities = {
  browserName: 'chrome',
  getPageTimeout: 30000,
  allScriptsTimeout: 60000,
  chromeOptions: {
    // tall, skinny window. trying to avoid errors where it says button is not visible/clickable
     args: [ '--window-size=800,1200' ]
   }
}

exports.config = config
