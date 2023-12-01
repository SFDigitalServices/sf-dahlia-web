World = require('../world.coffee')
EC = protractor.ExpectedConditions
Utils = require('../utils')
{ Given, When, Then, setWorldConstructor } = require('cucumber')

setWorldConstructor(World)

Given 'I try to go to a listing page with an invalid ID', ->
  url = '/listings/foofoofoofoo'
  Utils.Page.goTo(url)

Given /^I go to the "([^"]*)" listing page$/, (listing) ->
  url = switch listing
    when 'Test Listing'
      "/listings/#{Utils.Page.testListingId}"
    when 'Senior Test Listing'
      "/listings/#{Utils.Page.seniorListingId}"
    when 'Sale Test Listing'
      "/listings/#{Utils.Page.saleListingId}"
  Utils.Page.goTo(url + "?react=false")

When 'I click the Download Application button', ->
  element.all(By.id('download-application')).filter((elem) ->
    elem.isDisplayed()
  ).first().click()

Given 'I go to the welcome page', ->
  Utils.Page.goTo('/')

When 'I click the Buy link', ->
  buyLink = element(By.cssContainingText('.button', 'Buy')).click()
  browser.waitForAngular()

When 'I click the Rent link', ->
  buyLink = element(By.cssContainingText('.button', 'Rent')).click()
  browser.waitForAngular()

######################
# --- Expectations --- #
######################

Then 'I should be redirected to the welcome page', ->
  welcomeComponent = element(By.tagName('welcome-component'))
  browser.wait(EC.presenceOf(welcomeComponent), 5000)

Then 'I should see available units', ->
  propertyCard = element(By.tagName('property-card'))
  @expect(propertyCard.isPresent()).to.eventually.equal(true)

Then 'I should see at least one paper application download link', ->
  paperApplicationDownloadLink = element(By.className('paper-application-download'))
  @expect(paperApplicationDownloadLink.isPresent()).to.eventually.equal(true)

Then 'I should see the Buy link', ->
  buyLink = element(By.cssContainingText('.button', 'Buy'))
  @expect(buyLink.isPresent()).to.eventually.equal(true)

Then 'I should see the Rent link', ->
  buyLink = element(By.cssContainingText('.button', 'Rent'))
  @expect(buyLink.isPresent()).to.eventually.equal(true)

Then 'I should be on the Ownership listings page', ->
  @expect(browser.getCurrentUrl()).to.eventually.contain('/listings/for-sale')

Then 'I should be on the Rental listings page', ->
  @expect(browser.getCurrentUrl()).to.eventually.contain('/listings/for-rent')
