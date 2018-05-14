Utils = require('../../utils')

shortFormPages = {
  Name: 'apply/name'
  Contact: 'apply/contact'
}

module.exports = ->
  @When /^I hit the Next button "([^"]*)" times?$/, (buttonClicks) ->
    i = parseInt(buttonClicks)
    while i > 0
      Utils.Page.submit()
      i--

  @When 'I click the Save and Finish Later button', ->
    element(By.id('save_and_finish_later')).click()

  @When 'I continue my saved draft', ->
    Utils.Page.goTo('/continue-draft-sign-in/a0W0P00000F8YG4UAN')

  @Then /^I should be on the "([^"]*)" page of the application$/, (pageName) ->
    urlFrag = shortFormPages[pageName]
    Utils.Expect.urlContains(urlFrag)

  @Then /^I should see a form alert that says "([^"]*)"$/, (message) ->
    Utils.Expect.alertBox(@, message)

  @Then /^the application page title should be "([^"]*)"$/, (title) ->
    Utils.Expect.byCss(@, 'h2.app-card_question', title)

  @Then /^I should not be able to navigate to the "([^"]*)" section$/, (sectionName) ->
    browser.getCurrentUrl().then (currentUrl) ->
      element(By.cssContainingText('.progress-nav_item', sectionName)).click().then ->
        Utils.Expect.urlIs(currentUrl)
