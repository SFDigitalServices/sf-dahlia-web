PageUtil = require('../../utils/page-util')
EC = protractor.ExpectedConditions

# /sign-in is served by React now, so the old ng-model locators are gone and Angular
# sync has to stay off while we are on the page. Sign-in lands on /account, which is
# also React, so control goes back to PageUtil to decide the mode for whatever loaded
# rather than assuming we are back on an Angular page.
class ReactSignInPage
  constructor: ->
    @email = element(By.css('input[name="email"]'))
    @password = element(By.css('input[name="password"]'))
    # #sign-in-button is the devise form; the Clerk flow renders an unidentified
    # submit button inside the same form.
    @submitButton = element(By.css('#sign-in-button, form button[type="submit"]'))

  goTo: ->
    PageUtil.goTo('/sign-in')
    @waitUntilReady()

  waitUntilReady: ->
    browser.ignoreSynchronization = true
    browser.wait(EC.presenceOf(@password), 30000)
    browser.wait(EC.elementToBeClickable(@submitButton), 30000)

  signIn: (email, password) ->
    @waitUntilReady()
    @email.clear().sendKeys(email)
    @password.clear().sendKeys(password)
    @submitButton.click()
    browser.wait(EC.not(EC.urlContains('/sign-in')), 30000)
    PageUtil.syncWithCurrentPage()

module.exports = new ReactSignInPage
