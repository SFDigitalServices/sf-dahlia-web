Utils = require('../../utils')
{ Given, When, Then } = require('cucumber')

When 'I select my original application and submit', ->
  element(By.id('choose_draft_original')).click().then Utils.Page.submit

When 'I select my recent application and submit', ->
  element(By.id('choose_draft_recent')).click().then Utils.Page.submit

When 'I choose to continue my saved draft', ->
  element(By.id('continue-previous-draft')).click()

When 'I choose to start from scratch', ->
  element(By.id('start-from-scratch')).click()

When 'I choose to reconcile my application details by changing them to match my account details',
  ->
    element(By.id('choose-applicant-details')).click()
      .then Utils.Page.submit

When 'I choose to reconcile my application details by creating a new account', ->
  element(By.id('create-account')).click()
    .then Utils.Page.submit

When 'I choose to reconcile my application details by continuing without an account', ->
  element(By.id('continue-as-guest')).click()
    .then Utils.Page.submit

Then 'I should be on a page to reconcile my application details', ->
  text = "The primary contact details on your new application don't match
  your current account settings. What would you like to do?"
  el = element(By.cssContainingText('h1', text))
  @expect(el.isPresent()).to.eventually.equal(true)

Then 'I should be on the Choose Draft page', ->
  Utils.Expect.alertBox(@, 'Please choose which version of the application you want to use.')
