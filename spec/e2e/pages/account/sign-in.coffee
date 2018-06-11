AngularPage = require('../angular-page').AngularPage

class SignInPage extends AngularPage
  constructor: ->
    @email = element(By.id('auth_email'))
    @password = element(By.id('auth_password'))
    @signInButton = element(By.id('sign-in'))

  signIn: (email, password) ->
    @email.sendKeys(email)
    @password.sendKeys(password)
    @signInButton.click()
    browser.waitForAngular()

  signInPrefilled: (password) ->
    @password.sendKeys(password)
    @signInButton.click()
    browser.waitForAngular()

module.exports = new SignInPage
