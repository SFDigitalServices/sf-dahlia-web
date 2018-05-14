Utils = require('../utils')
AccountPages = require('../pages/account')

module.exports = ->
  @Given /^I have a confirmed account for "([^"]*)" with birth date "([^"]*)"$/,
    (fullName, birthDate) ->
      account = Utils.Account.create(fullName, birthDate)

      Utils.Page.goTo('/create-account')

      AccountPages.Create.fill {
        fullName: account.fullName
        birthDate: account.birthDate
        email: account.email
        password: account.password
      }

      Utils.Account.confirm(account.email)

  @When /^I create an account for "([^"]*)"$/, (fullName) ->
    existingAccount = Utils.Account.get(fullName)
    # console.log(existingAccount)

    account = if existingAccount then existingAccount else Utils.Account.create(fullName)
    # console.log(account)

    AccountPages.Create.fill {
      fullName: account.fullName
      birthDate: account.birthDate
      email: account.email
      password: account.password
    }

    Utils.Account.confirm(account.email) unless existingAccount

  @When /^I sign in as "([^"]*)"$/, (fullName) ->
    account = Utils.Account.get(fullName)
    AccountPages.SignIn.signIn(account.email, account.password)

  @When /^I sign in as "([^"]*)" with my email pre-filled$/, (fullName) ->
    account = Utils.Account.get(fullName)
    AccountPages.SignIn.signInPrefilled(account.password)

  @When 'I sign out', ->
    element(By.cssContainingText('a[dropdown-toggle="#my-account-dropdown"]', 'My Account')).click().then ->
      element(By.cssContainingText('#my-account-dropdown a', 'Sign Out')).click()

  @When 'I sign out without saving', ->
    element(By.cssContainingText('a[dropdown-toggle="#my-account-dropdown"]', 'My Account')).click()
    .then(
      ->
        element(By.cssContainingText('#my-account-dropdown a', 'Sign Out')).click()
    ).then(
      ->
        element(By.css('.reveal-modal button.primary')).click()
    )

  @Then 'I should be logged in', ->
    Utils.Expect.byCss(@, 'nav a[href="/my-account"]', 'My Account')
