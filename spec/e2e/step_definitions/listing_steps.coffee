World = require('../world.coffee')
Utils = require('../utils')
{ Given, Then, setWorldConstructor } = require('cucumber')

setWorldConstructor(World)

Given 'I try to go to a listing page with an invalid ID', ->
  url = "/listings/foofoofoofoo"
  Utils.Page.goTo(url)

######################
# --- Expectations --- #
######################

Then 'I should be redirected to the welcome page', ->
  welcomeComponent = element(By.tagName('welcome-component'))
  @expect(welcomeComponent.isPresent()).to.eventually.equal(true)

Given 'I try to go to a sale listings page', ->
  url = "/listings/for-sale"
  Utils.Page.goTo(url)

######################
# --- Expectations --- #
######################

Then 'I should see available units', ->
  propertyCard = element(By.tagName('property-card'))
  @expect(propertyCard.isPresent()).to.eventually.equal(true)