EC = protractor.ExpectedConditions

# The standalone /sign-in and /create-account routes are served by React now, so
# protractor's Angular sync hangs on them and the old ng-model locators are gone.
# Sync has to stay off for the whole interaction and is restored once the click
# lands us back on an Angular page.
class ReactSignInPage
  constructor: ->
    @email = element(By.css('input[name="email"]'))
    @password = element(By.css('input[name="password"]'))
    @submitButton = element(By.css('form button[type="submit"]'))

  goTo: ->
    browser.ignoreSynchronization = true
    browser.get('/sign-in')
    browser.wait(EC.presenceOf(@password), 20000)

  signIn: (email, password) ->
    @email.clear().sendKeys(email)
    @password.clear().sendKeys(password)
    @submitButton.click()
    # Signing in leaves React for an Angular page, so wait for the URL to change
    # before handing control back to protractor's synchronized mode.
    browser.wait(EC.not(EC.urlContains('/sign-in')), 20000)
    browser.ignoreSynchronization = false
    browser.waitForAngular()

module.exports = new ReactSignInPage
