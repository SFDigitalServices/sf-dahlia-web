Utils = require('../utils')
{ Given, When, Then } = require('cucumber')

pageUrls = {
  Contact: 'contact'
  Income: 'income'
  'Income Vouchers': 'income-vouchers'
  'My Applications': 'my-applications'
  Name: 'name'
  Prerequisites: 'prerequisites'
  Priorities: 'household-priorities'
}

Given /^I go to the first page of the "([^"]*)" application$/, (listing) ->
  url = switch listing
    when 'Test Listing'
      "/listings/#{Utils.Page.testListingId}/apply/name"
    when 'Senior Test Listing'
      "/listings/#{Utils.Page.seniorListingId}/apply-welcome/community-screening"
    when 'Sale Test Listing'
      "/listings/#{Utils.Page.saleListingId}/apply-welcome/overview"
    when 'Custom Educator 2 Test Listing'
      # This listing should be a clone of 'Test Listing', except that Custom_Listing_Type == 'Educator 2: SFUSD employees & public'
      # If there are issues with the e2e tests, go to Salesforce and check that this listing has the same Preferences and Units as 'Test Listing'
      "/listings/#{Utils.Page.customEducatorListing2Id}/apply-welcome/custom-educator-screening"

  Utils.Page.goTo(url)

Given /^I go to the welcome page of the "([^"]*)" application$/, (listing) ->
  listingId = switch listing
    when 'Test Listing'
      Utils.Page.testListingId
    when 'Senior Test Listing'
      Utils.Page.seniorListingId
    when 'Sale Test Listing'
      Utils.Page.saleListingId
    when 'Custom Educator 2 Test Listing'
      Utils.Page.customEducatorListing2Id
  Utils.Page.goTo("/listings/#{listingId}/apply-welcome/intro")

When /^I go to the "([^"]*)" page$/, (pageName) ->
  Utils.Page.goTo(pageUrls[pageName])

When /^I hit the Next button "([^"]*)" times?$/, (buttonClicks) ->
  i = parseInt(buttonClicks)
  while i > 0
    browser.waitForAngular()
    Utils.Page.submit()
    i--

When 'I click the Save and Finish Later button', ->
  element(By.id('save_and_finish_later')).click()

When 'I click the Start with these details button', ->
  element(By.id('start_with_autofill')).click()

When 'I continue my saved draft for the Test Listing', ->
  Utils.Page.goTo("/continue-draft-sign-in/#{Utils.Page.testListingId}")

When 'I continue my saved draft for the Senior Test Listing', ->
  Utils.Page.goTo("/continue-draft-sign-in/#{Utils.Page.seniorListingId}")

When 'I cancel the modal', ->
  browser.waitForAngular()
  element(By.cssContainingText('button', 'Stay')).click()

When 'I confirm the modal', ->
  browser.waitForAngular()
  element(By.cssContainingText('button', 'Leave')).click()

When 'I close the modal', ->
  browser.waitForAngular()
  element(By.css('a[aria-label="Close"]')).click()

When 'I continue without signing in', ->
  element(By.id('confirm_no_account')).click()

When 'I pause', ->
  browser.pause()

When 'I use the browser back button', ->
  browser.navigate().back()

When 'I go to the listings page in Spanish', ->
  Utils.Page.goTo('/es/listings')

When /^I navigate to the "([^"]*)" section$/, (section) ->
  element.all(By.css('.progress-nav'))
    .all(By.linkText(section.toUpperCase()))
    .first()
    .click()
  browser.waitForAngular()

When /^I wait "([^"]*)" seconds/, (delay) ->
  # pause before continuing
  delay = parseInt(delay) * 1000
  browser.sleep(delay)

# helper method to delineate tests
When /^--I reach the "([^"]*)" step--/, (stepName) ->
  # do nothing in particular
  browser.waitForAngular()

Then /^I should be on the "([^"]*)" page$/, (pageName) ->
  urlFrag = pageUrls[pageName]
  Utils.Expect.urlContains(urlFrag)

Then /^I should be on the "([^"]*)" page of the application$/, (pageName) ->
  urlFrag = "apply/#{pageUrls[pageName]}"
  Utils.Expect.urlContains(urlFrag)

Then /^I should see a form alert that says "([^"]*)"$/, (message) ->
  Utils.Expect.alertBox(@, message)

Then /^I should see a form notice that says "([^"]*)"$/, (message) ->
  Utils.Expect.alertNotice(@, message)

Then /^the application page title should be "([^"]*)"$/, (title) ->
  Utils.Expect.byCss(@, 'h2.app-card_question', title)

Then /^I should not be able to navigate to the "([^"]*)" section$/, (sectionName) ->
  browser.getCurrentUrl().then (currentUrl) ->
    element(By.cssContainingText('.progress-nav_item', sectionName)).click().then ->
      Utils.Expect.urlIs(currentUrl)

Then /^I should see a modal that says "([^"]*)"$/, (modalContent) ->
  Utils.Expect.byCss(@, '.modal-inner', modalContent)

Then 'I should still be on the application page', ->
  Utils.Expect.urlContains('apply')

Then 'I should see an error about selecting an option', ->
  Utils.Expect.alertBox(@,
    'Please select and complete one of the options below in order to continue')
  Utils.Expect.error(@, 'Please select one of the options above')

Then 'I should see a PO Boxes not allowed error', ->
  Utils.Expect.alertBox(@)
  Utils.Expect.error(@, 'PO Boxes are not allowed.')

Then 'I should see an address not found error', ->
  Utils.Expect.alertBox(@)
  Utils.Expect.error(@, 'This address was not found. Please check the house number, street, and city entered. PO Boxes are not allowed.')
