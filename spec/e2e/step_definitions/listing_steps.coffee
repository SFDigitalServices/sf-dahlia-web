World = require('../world.coffee').World
Chance = require('chance')
chance = new Chance()
EC = protractor.ExpectedConditions

getUrlAndCatchPopup = (url) ->
  # always catch and confirm popup alert in case we are leaving an existing application
  # (i.e. from a previous test)
  browser.get(url).catch ->
    browser.switchTo().alert().then (alert) ->
      alert.accept()
      browser.get url

module.exports = ->
  # import global cucumber options
  @World = World

  @Given 'I try to go to a listing page with an invalid ID', ->
    url = "/listings/foofoofoofoo"
    getUrlAndCatchPopup(url)

  ######################
  # --- Expectations --- #
  ######################

  @Then 'I should be redirected to the listings page', ->
    listingsHeader = element(By.id('listings_header'))
    @expect(listingsHeader.isPresent()).to.eventually.equal(true)
