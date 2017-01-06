World = require('../world.coffee').World

# QA "Test Listing"
listingId = 'a0W0P00000DYUcpUAH'

module.exports = ->
  @World = World

  @Given 'I go to the first page of the application', ->
    url = "/listings/#{listingId}/apply/name"
    # always catch and confirm popup alert in case we are leaving an existing application
    # (i.e. from a previous test)
    browser.get(url).catch ->
      browser.switchTo().alert().then (alert) ->
        alert.accept()
        browser.get url

  @When 'I fill out the short form Name page', ->
    element(By.model('applicant.firstName')).sendKeys('Jane')
    element(By.model('applicant.lastName')).sendKeys('Doe')
    element(By.model('applicant.dob_month')).sendKeys('02')
    element(By.model('applicant.dob_day')).sendKeys('22')
    element(By.model('applicant.dob_year')).sendKeys('1990')
    element(By.id('submit')).click()

  @When 'I fill out the short form Contact page', ->
    element(By.model('applicant.phone')).sendKeys('2222222222')
    element(By.model('applicant.phoneType')).click()
    element(By.cssContainingText('option', 'Home')).click()
    element(By.model('applicant.email')).sendKeys('jane@doe.com')
    element(By.model('applicant.noAddress')).click()
    element(By.id('workInSf_yes')).click()
    element(By.id('submit')).click()

  @When 'I don\'t indicate an alternate contact', ->
    element(By.id('alternate_contact_none')).click()
    element(By.id('submit')).click()

  @When 'I indicate I will live alone', ->
    element(By.id('live_alone')).click()

  @When 'I don\'t choose any preferences', ->
    # skip d1
    element(By.id('submit')).click()
    # skip d2 (because we did mark workInSf, this page will show up)
    element(By.id('submit')).click()
    # also skip general lottery notice
    element(By.id('submit')).click()

  @When 'I indicate having vouchers', ->
    element(By.id('householdVouchersSubsidies_yes')).click()
    element(By.id('submit')).click()

  @When 'I fill out my income', ->
    element(By.id('incomeTotal')).sendKeys('22000')
    element(By.id('per_year')).click()
    element(By.id('submit')).click()

  @When 'I fill out the optional survey', ->
    element(By.id('referral_newspaper')).click()
    element(By.id('submit')).click()

  @When 'I confirm details on the review page', ->
    element(By.id('submit')).click()

  @When 'I agree to the terms and submit', ->
    element(By.id('terms_yes')).click()
    element(By.id('submit')).click()

  @When 'I click the Save and Finish Later button', ->
    element(By.id('save_and_finish_later')).click()

  @When 'I fill out my account info', ->
    email = @chance.email()
    element(By.id('auth_email')).sendKeys(email)
    element(By.id('auth_email_confirmation')).sendKeys(email)
    element(By.id('auth_password')).sendKeys('password123')
    element(By.id('auth_password_confirmation')).sendKeys('password123')

  @When 'I submit the Create Account form', ->
    element(By.id('submit')).click()


  ######################
  # --- Expectations --- #
  ######################

  @Then 'I should see my lottery number on the confirmation page', ->
    lotteryNumberMarkup = element(By.id('lottery_number'))
    @expect(lotteryNumberMarkup.getText()).to.eventually.exist

  # @Then 'I should be on the login page with the email confirmation popup', {timeout: 9000}, ->
  @Then 'I should be on the login page with the email confirmation popup', ->
    confirmationPopup = element(By.id('confirmation_needed'))
    @expect(confirmationPopup.getText()).to.eventually.exist
