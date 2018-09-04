World = require('../world.coffee')
Utils = require('../utils')
{ defineSupportCode } = require('cucumber')

defineSupportCode( ({Given, Then, setWorldConstructor}) ->

  setWorldConstructor(World)

  Given 'I try to go to a listing page with an invalid ID', ->
    url = "/listings/foofoofoofoo"
    Utils.Page.goTo(url)

  ######################
  # --- Expectations --- #
  ######################

  Then 'I should be redirected to the listings page', ->
    listingsHeader = element(By.id('listings_header'))
    @expect(listingsHeader.isPresent()).to.eventually.equal(true)
)