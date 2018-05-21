Utils = require('../utils')

pageUrls = {
  Name: 'name'
  Contact: 'contact'
  'My Applications': 'my-applications'
}

module.exports = ->
  @Given 'I go to the first page of the Senior Test Listing application', ->
    url = "/listings/#{Utils.Page.seniorListingId}/apply-welcome/community-screening"
    Utils.Page.goTo(url)

  @When /^I go to the "([^"]*)" page$/, (pageName) ->
    Utils.Page.goTo(pageUrls[pageName])

  @When /^I hit the Next button "([^"]*)" times?$/, (buttonClicks) ->
    i = parseInt(buttonClicks)
    while i > 0
      Utils.Page.submit()
      i--

  @When 'I click the Save and Finish Later button', ->
    element(By.id('save_and_finish_later')).click()

  @When 'I continue my saved draft for the Test Listing', ->
    Utils.Page.goTo("/continue-draft-sign-in/#{Utils.Page.testListingId}")

  @When 'I continue my saved draft for the Senior Test Listing', ->
    Utils.Page.goTo("/continue-draft-sign-in/#{Utils.Page.seniorListingId}")

  @Then /^I should be on the "([^"]*)" page$/, (pageName) ->
    urlFrag = pageUrls[pageName]
    Utils.Expect.urlContains(urlFrag)

  @Then /^I should be on the "([^"]*)" page of the application$/, (pageName) ->
    urlFrag = "apply/#{pageUrls[pageName]}"
    Utils.Expect.urlContains(urlFrag)

  @Then /^I should see a form alert that says "([^"]*)"$/, (message) ->
    Utils.Expect.alertBox(@, message)

  @Then /^I should see a form notice that says "([^"]*)"$/, (message) ->
    Utils.Expect.alertNotice(@, message)

  @Then /^the application page title should be "([^"]*)"$/, (title) ->
    Utils.Expect.byCss(@, 'h2.app-card_question', title)

  @Then /^I should not be able to navigate to the "([^"]*)" section$/, (sectionName) ->
    browser.getCurrentUrl().then (currentUrl) ->
      element(By.cssContainingText('.progress-nav_item', sectionName)).click().then ->
        Utils.Expect.urlIs(currentUrl)

  @Then /^I should see a modal that says "([^"]*)"$/, (modalContent) ->
    Utils.Expect.byCss(@, '.modal-inner', modalContent)
