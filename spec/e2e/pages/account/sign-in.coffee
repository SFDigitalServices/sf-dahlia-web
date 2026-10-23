AngularPage = require('../angular-page').AngularPage

class SignInPage extends AngularPage
  constructor: ->
    super()
    @email = element(By.id('auth_email'))
    @password = element(By.id('auth_password'))
    @signInButton = element(By.id('sign-in'))

  signIn: (email, password) ->
    @email.sendKeys(email)
    @password.sendKeys(password)
    @signInButton.click()
    browser.waitForAngular()

  # the React sign-in page (/sign-in); open it with Utils.Page.goToReact
  signInReact: (email, password) ->
    EC = protractor.ExpectedConditions
    emailField = element(By.css('input[name="email"]'))
    browser.wait(EC.presenceOf(emailField), 10000)
    emailField.sendKeys(email)
    element(By.css('input[name="password"]')).sendKeys(password)
    element(By.id('sign-in-button')).click()
    browser.wait(EC.not(EC.urlContains('/sign-in')), 10000)

  signInPrefilled: (password) ->
    @password.sendKeys(password)
    @signInButton.click()
    browser.waitForAngular()

module.exports = new SignInPage
