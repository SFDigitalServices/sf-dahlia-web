World = require('../world.coffee').World
EC = protractor.ExpectedConditions

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

  @When /^I fill out the short form Name page as "([^"]*)"$/, (fullName) ->
    firstName = fullName.split(' ')[0]
    lastName  = fullName.split(' ')[1]
    element(By.model('applicant.firstName')).sendKeys(firstName)
    element(By.model('applicant.lastName')).sendKeys(lastName)
    element(By.model('applicant.dob_month')).sendKeys('02')
    element(By.model('applicant.dob_day')).sendKeys('22')
    element(By.model('applicant.dob_year')).sendKeys('1990')
    element(By.id('submit')).click()

  @When 'I fill out the short form Contact page with No Address and WorkInSF', ->
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

  @When 'I go to the second page of preferences', ->
    # skip d1
    element(By.id('submit')).click()

  @When /^I select "([^"]*)" for "([^"]*)" in Live\/Work preference$/, (fullName, preference) ->
    # select either Live or Work preference in the combo Live/Work checkbox
    element(By.id('preferences-liveWorkInSf')).click()
    element(By.id('liveWorkPrefOption')).click()
    element(By.cssContainingText('option', preference)).click()
    # select the correct HH member in the dropdown
    pref = (if preference == 'Live in San Francisco' then 'liveInSf' else 'workInSf')
    # there are multiple liveInSf_household_members, click the visible one
    element.all(By.id("#{pref}_household_member")).filter((elem) ->
      elem.isDisplayed()
    ).first().click()
    # there are multiple Jane Doe options, click the visible one matching fullName
    element.all(By.cssContainingText('option', fullName)).filter((elem) ->
      elem.isDisplayed()
    ).first().click()

  @When 'I go back to the Contact page and change WorkInSF to No', ->
    element(By.cssContainingText('.progress-nav_item', 'You')).click()
    element(By.id('submit')).click()
    element(By.id('workInSf_no')).click()

  @When 'I go back to the second page of preferences', ->
    element(By.cssContainingText('.progress-nav_item', 'Preferences')).click()
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

  @When 'I use the browser back button', ->
    browser.navigate().back()


  ######################
  # --- Expectations --- #
  ######################

  @Then 'I should see my lottery number on the confirmation page', ->
    lotteryNumberMarkup = element(By.id('lottery_number'))
    @expect(lotteryNumberMarkup.getText()).to.eventually.exist

  @Then 'I should be on the login page with the email confirmation popup', ->
    confirmationPopup = element(By.id('confirmation_needed'))
    @expect(confirmationPopup.getText()).to.eventually.exist

  @Then 'I should still see the single Live in San Francisco preference selected', ->
    liveInSf = element(By.id('preferences-liveInSf'))
    browser.wait(EC.elementToBeSelected(liveInSf), 5000)

  @Then 'I should still see the preference options and uploader input visible', ->
    # there are multiple liveInSf_household_members, click the visible one
    liveInSfMember = element.all(By.id('liveInSf_household_member')).filter((elem) ->
      elem.isDisplayed()
    ).first()
    # expect the member selection field to still be there
    @expect(liveInSfMember.getText()).to.eventually.exist
