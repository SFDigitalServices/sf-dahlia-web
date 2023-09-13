AngularPage = require('../angular-page').AngularPage

class CustomEducatorScreening extends AngularPage
  constructor: ->
    super()
    @customEducatorJobClassificationNumber = element(By.model('application.customEducatorJobClassificationNumber'))

    @defaults = {
      # number taken from ShortFormHelperService.customEducatorValidJobClassificationNumbers
      customEducatorJobClassificationNumber: '0110'
    }

  fill: (customEducatorJobClassificationNumber) ->
    browser.waitForAngular()
    @customEducatorJobClassificationNumber.clear().sendKeys(customEducatorJobClassificationNumber)

module.exports.CustomEducatorScreening = CustomEducatorScreening
