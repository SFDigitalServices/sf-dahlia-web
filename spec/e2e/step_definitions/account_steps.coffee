Utils = require('../utils')
AccountPages = require('../pages/account')

module.exports = ->
  @Given /^I have confirmed the account for "([^"]*)"$/, (fullName) ->
    account = Utils.Account.get(fullName)
    Utils.Account.confirm(account.email)

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
    account = if existingAccount then existingAccount else Utils.Account.create(fullName)

    AccountPages.Create.fill {
      fullName: account.fullName
      birthDate: account.birthDate
      email: account.email
      password: account.password
    }

    Utils.Account.confirm(account.email) unless existingAccount

  @When /^I create an account for "([^"]*)" with my pre-filled application details$/,
    (fullName) ->
      account = Utils.Account.get(fullName)

      AccountPages.Create.prefilled {
        email: account.email
        password: account.password
      }

  @When 'I click the Create Account button', ->
    createAccount = element(By.id('create-account'))
    Utils.Page.scrollToElement(createAccount).then ->
      createAccount.click()

  @When 'I click the Sign In button', ->
    signIn = element(By.id('sign-in'))
    Utils.Page.scrollToElement(signIn).then ->
      signIn.click()

  @When 'I go to the Sign In page', ->
    signInUrl = "/sign-in"
    Utils.Page.goTo(signInUrl)

  @When /^I sign in as "([^"]*)"$/, (fullName) ->
    account = Utils.Account.get(fullName)
    AccountPages.SignIn.signIn(account.email, account.password)

  @When /^I sign in as "([^"]*)" with my email pre-filled$/, (fullName) ->
    account = Utils.Account.get(fullName)
    AccountPages.SignIn.signInPrefilled(account.password)

  @When 'I sign out', ->
    element(By.cssContainingText('a[dropdown-toggle="#my-account-dropdown"]', 'My Account'))
      .click().then ->
        element(By.cssContainingText('#my-account-dropdown a', 'Sign Out')).click()

  @When 'I sign out without saving', ->
    element(By.cssContainingText('a[dropdown-toggle="#my-account-dropdown"]', 'My Account')).click()
    .then ->
      element(By.cssContainingText('#my-account-dropdown a', 'Sign Out')).click()
    .then Utils.Page.confirmModal

  @When 'I view the application from My Applications', ->
    element(By.cssContainingText('.button', 'Go to My Applications')).click().then ->
      element(By.cssContainingText('.button', 'View Application')).click()

  @When 'I go to My Applications', ->
    Utils.Page.goTo('/my-applications')

  @When 'I click the Continue Application button', ->
    element(By.cssContainingText('.feed-item-action a', 'Continue Application')).click()

  @When /^I delete my application for the "([^"]*)"$/, (listing) ->
    listingId = switch listing
      when 'Test Listing'
        Utils.Page.testListingId
      when 'Senior Test Listing'
        Utils.Page.seniorListingId

    element(By.cssContainingText("a[href=\"/listings/#{listingId}\"] + .button-link", 'Delete'))
      .click().then Utils.Page.confirmModal

  @When 'I try to navigate to the Favorites page', ->
    browser.waitForAngular()
    element.all(By.cssContainingText('a', 'My Favorites')).filter((elem) ->
      elem.isDisplayed()
    ).first().click()

  @Then 'I should be signed in', ->
    Utils.Expect.byCss(@, 'nav a[href="/my-account"]', 'My Account')

  @Then 'I should be signed out', ->
    Utils.Expect.byCss(@, '.nav-menu a[href="/sign-in"]', 'Sign In')

  @Then 'I should be on the login page with the email confirmation popup', ->
    confirmationPopup = element(By.id('confirmation_needed'))
    @expect(confirmationPopup.isPresent()).to.eventually.equal(true)

  @Then 'I should see my draft application with a Continue Application button', ->
    continueApplication =
      element(By.cssContainingText('.feed-item-action a', 'Continue Application'))
    @expect(continueApplication.isPresent()).to.eventually.equal(true)

  @Then 'I should land on the My Applications page', ->
    el = element(By.cssContainingText('h1', 'My Applications'))
    @expect(el.isPresent()).to.eventually.equal(true)

  @Then 'I should see the Favorites page', ->
    Utils.Expect.urlContains('favorites')

  @Then 'I should land on the Sign In page', ->
    el = element(By.cssContainingText('h1', 'Sign In'))
    @expect(el.isPresent()).to.eventually.equal(true)

  @Then 'I should see the sign out success message', ->
    el = element(
      By.cssContainingText('p.alert-body', 'You have successfully logged out of your account.'))
    @expect(el.isPresent()).to.eventually.equal(true)
