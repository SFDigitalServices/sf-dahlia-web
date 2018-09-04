Utils = require('../../utils')
{ defineSupportCode } = require('cucumber')

defineSupportCode( ({When}) ->
  When /^I answer "([^"]*)" to the community screening question$/, (answer) ->
    element(By.id("answeredCommunityScreening_#{answer.toLowerCase()}")).click()
    Utils.Page.submit()

  When 'I continue past the welcome overview', ->
    # welcome overview
    Utils.Page.submit()
)

