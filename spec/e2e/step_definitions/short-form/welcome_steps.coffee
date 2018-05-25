Utils = require('../../utils')

module.exports = ->
  @When 'I answer yes to the community screening question', ->
    element(By.id('answeredCommunityScreening_yes')).click()
    Utils.Page.submit()

  @When 'I continue past the welcome overview', ->
    # welcome overview
    Utils.Page.submit()
