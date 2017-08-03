World = require('../world.coffee').World
Chance = require('chance')
chance = new Chance()
EC = protractor.ExpectedConditions

getUrl = (url) ->
  browser.get(url)

module.exports = ->
  # import global cucumber options
  @World = World

  @Given 'I try to go to a listing page with an invalid ID', ->
    url = "/listings/foofoofoofoo"
    getUrl(url)

  ######################
  # --- Expectations --- #
  ######################

  @Then 'I should be redirected to the listings page', ->
    listingsHeader = element(By.id('listings_header'))
    @expect(listingsHeader.isPresent()).to.eventually.equal(true)
