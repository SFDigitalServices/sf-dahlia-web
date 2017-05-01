World = require('../world.coffee').World
Chance = require('chance')
chance = new Chance()
EC = protractor.ExpectedConditions

# QA "280 Fell"
listingId = 'a0W0P00000DZTkAUAX'
sessionEmail = chance.email()
janedoeEmail = chance.email()
accountPassword = 'password123'

# reusable functions
fillOutContactPage = (opts = {}) ->
  opts.address1 ||= '4053 18th St.'
  element(By.model('applicant.phone')).clear().sendKeys('2222222222')
  element(By.model('applicant.phoneType')).click()
  element(By.cssContainingText('option', 'Home')).click()
  element(By.model('applicant.email')).clear().sendKeys(opts.email) if opts.email
  element(By.id('applicant_home_address_address1')).clear().sendKeys(opts.address1)
  element(By.id('applicant_home_address_city')).clear().sendKeys('San Francisco')
  element(By.cssContainingText('option', 'California')).click()
  element(By.id('applicant_home_address_zip')).clear().sendKeys('94114')
  element(By.id('workInSf_yes')).click()

optOutAndSubmit = ->
  # opt out + submit preference page (e.g. NRHP, Live/Work)
  element(By.id('preference-optout')).click()
  element(By.id('submit')).click()

getUrlAndCatchPopup = (url) ->
  # always catch and confirm popup alert in case we are leaving an existing application
  # (i.e. from a previous test)
  browser.get(url).catch ->
    browser.switchTo().alert().then (alert) ->
      alert.accept()
      browser.get url

submitForm = () ->
  element(By.id('submit')).click()

module.exports = ->
  # import global cucumber options
  @World = World

  @Given 'I go to the first page of the Test Listing application', ->
    url = "/listings/#{listingId}/apply/name"
    getUrlAndCatchPopup(url)

  @Given 'I have a confirmed account', ->
    # confirm the account
    browser.ignoreSynchronization = true
    url = "/api/v1/account/confirm/?email=#{sessionEmail}"
    getUrlAndCatchPopup(url)
    browser.ignoreSynchronization = false

  @When /^I fill out the Name page as "([^"]*)"$/, (fullName) ->
    firstName = fullName.split(' ')[0]
    lastName  = fullName.split(' ')[1]
    element(By.model('applicant.firstName')).clear().sendKeys(firstName)
    element(By.model('applicant.lastName')).clear().sendKeys(lastName)
    element(By.model('applicant.dob_month')).clear().sendKeys('02')
    element(By.model('applicant.dob_day')).clear().sendKeys('22')
    element(By.model('applicant.dob_year')).clear().sendKeys('1990')
    submitForm()

  @When 'I submit the Name page with my account info', ->
    submitForm()

  @When 'I fill out the Contact page with an address (non-NRHP match) and WorkInSF', ->
    fillOutContactPage({email: janedoeEmail})
    submitForm()

  @When 'I fill out the Contact page with an address (NRHP match) and WorkInSF', ->
    fillOutContactPage({email: janedoeEmail, address1: '1222 Harrison St.'})
    submitForm()

  @When 'I fill out the Contact page with my account email, an address (non-NRHP match) and WorkInSF', ->
    fillOutContactPage()
    submitForm()

  @When 'I confirm my address', ->
    element(By.id('confirmed_home_address_yes')).click()
    submitForm()

  @When 'I don\'t indicate an alternate contact', ->
    element(By.id('alternate_contact_none')).click()
    submitForm()

  @When 'I indicate I will live alone', ->
    element(By.id('live-alone')).click()

  @When 'I indicate other people will live with me', ->
    element(By.id('other-people')).click()
    # also submit the household overview page
    submitForm()

  @When /^I add another household member named "([^"]*)"$/, (fullName) ->
    # click into the Add Household Member form
    element(By.id('add-member')).click()


    firstName = fullName.split(' ')[0]
    lastName  = fullName.split(' ')[1]
    element(By.model('householdMember.firstName')).sendKeys(firstName)
    element(By.model('householdMember.lastName')).sendKeys(lastName)
    element(By.model('householdMember.dob_month')).sendKeys('10')
    element(By.model('householdMember.dob_day')).sendKeys('04')
    element(By.model('householdMember.dob_year')).sendKeys('1985')
    element(By.id('hasSameAddressAsApplicant_yes')).click()
    element(By.id('workInSf_no')).click()
    element.all(By.cssContainingText('option', 'Spouse')).filter((elem) ->
      elem.isDisplayed()
    ).first().click()
    # finish adding member
    submitForm()

  @When 'I indicate being done adding other people', ->
    submitForm()

  @When 'I indicate living in public housing', ->
    element(By.id('STUB_householdPublicHousing_yes')).click()
    submitForm()

  @When 'I indicate not living in public housing', ->
    element(By.id('STUB_householdPublicHousing_no')).click()
    submitForm()

  @When /^I enter "([^"]*)" for my monthly rent$/, (monthlyRent) ->
    element(By.id('monthlyRent_0')).sendKeys(monthlyRent)
    submitForm()

  @When 'I indicate no priority', ->
    element(By.id('STUB_prioritiesSelected_no')).click()
    submitForm()

  @When 'I go to the income page', ->
    submitForm()

  @When 'I indicate having vouchers', ->
    element(By.id('householdVouchersSubsidies_yes')).click()
    submitForm()

  @When 'I fill out my income', ->
    element(By.id('incomeTotal')).sendKeys('22000')
    element(By.id('per_year')).click()
    submitForm()

  @When 'I continue past the Lottery Preferences intro', ->
    submitForm()

  @When 'I opt out of Assisted Housing preference', ->
    optOutAndSubmit()

  @When 'I don\'t choose COP/DTHP preferences', ->
    # skip preferences programs
    submitForm()
    # also skip general lottery notice
    submitForm()

  @When 'I opt out of Live/Work preference', ->
    optOutAndSubmit()

  @When 'I opt out of NRHP preference', ->
    optOutAndSubmit()

  @When 'I select Rent Burden Preference', ->
    element(By.id('preferences-rentBurden')).click()


  @When /^I select "([^"]*)" for COP preference$/, (fullName) ->
    element(By.id('preferences-certOfPreference')).click()
    element.all(By.id('certOfPreference_household_member')).filter((elem) ->
      elem.isDisplayed()
    ).first().click()
    element.all(By.cssContainingText('option', fullName)).filter((elem) ->
      elem.isDisplayed()
    ).first().click()

  @When /^I select "([^"]*)" for DTHP preference$/, (fullName) ->
    element(By.id('preferences-displaced')).click()
    element.all(By.id('displaced_household_member')).filter((elem) ->
      elem.isDisplayed()
    ).last().click()
    element.all(By.cssContainingText('option', fullName)).filter((elem) ->
      elem.isDisplayed()
    ).last().click()

  @When 'I go to the income page', ->
    submitForm()

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
    submitForm()
    element(By.id('workInSf_no')).click()

  @When 'I go back to the Live/Work preference page', ->
    element(By.cssContainingText('.progress-nav_item', 'Preferences')).click()
    # skip intro
    submitForm()
    # skip NRHP (if exists)
    if element(By.id('preferences-neighborhoodResidence'))
      submitForm()

  @When 'I submit my preferences', ->
    submitForm()

  @When 'I fill out the optional survey', ->
    element(By.id('referral_newspaper')).click()
    submitForm()

  @When 'I confirm details on the review page', ->
    submitForm()

  @When 'I continue confirmation without signing in', ->
    element(By.id('confirm_no_account')).click()

  @When 'I agree to the terms and submit', ->
    element(By.id('terms_yes')).click()
    submitForm()

  @When 'I click the Save and Finish Later button', ->
    element(By.id('save_and_finish_later')).click()

  @When 'I click the Create Account button', ->
    element(By.id('create-account')).click()

  @When 'I fill out my account info', ->
    element(By.id('auth_email')).sendKeys(sessionEmail)
    element(By.id('auth_email_confirmation')).sendKeys(sessionEmail)
    element(By.id('auth_password')).sendKeys(accountPassword)
    element(By.id('auth_password_confirmation')).sendKeys(accountPassword)

  @When 'I fill out my account info with my locked-in application email', ->
    element(By.id('auth_email_confirmation')).sendKeys(janedoeEmail)
    element(By.id('auth_password')).sendKeys(accountPassword)
    element(By.id('auth_password_confirmation')).sendKeys(accountPassword)

  @When 'I submit the Create Account form', ->
    submitForm()
    browser.waitForAngular()

  @When /^I wait "([^"]*)" seconds/, (delay) ->
    # pause before continuing
    delay = parseInt(delay) * 1000
    browser.sleep(delay)

  @When 'I sign in', ->
    signInUrl = "/sign-in"
    getUrlAndCatchPopup(signInUrl)
    element(By.id('auth_email')).sendKeys(sessionEmail)
    element(By.id('auth_password')).sendKeys(accountPassword)
    element(By.id('sign-in')).click()
    browser.waitForAngular()

  @When 'I view the application from My Applications', ->
    element(By.cssContainingText('.button', 'Go to My Applications')).click()
    element(By.cssContainingText('.button', 'View Application')).click()
    browser.waitForAngular()

  @When 'I go to My Applications', ->
    element(By.cssContainingText('.dash-item', 'My Applications')).click()
    browser.waitForAngular()

  @When 'I click the Continue Application button', ->
    element(By.cssContainingText('.feed-item-action a', 'Continue Application')).click()
    browser.waitForAngular()

  @When 'I use the browser back button', ->
    browser.navigate().back()

  #######################
  # --- Error cases --- #
  #######################

  @When "I don't fill out the Name page", ->
    element(By.id('submit')).click()

  @When "I fill out the Name page with an invalid DOB", ->
    element(By.model('applicant.firstName')).sendKeys('Jane')
    element(By.model('applicant.lastName')).sendKeys('Doe')
    element(By.model('applicant.dob_month')).sendKeys('12')
    element(By.model('applicant.dob_day')).sendKeys('33')
    element(By.model('applicant.dob_year')).sendKeys('2019')
    element(By.id('submit')).click()

  @When "I fill out the Contact page with an address that isn't found", ->
    fillOutContactPage({email: janedoeEmail, address1: '38383 Philz Way'})
    element(By.id('submit')).click()

  @When "I don't select opt out or Live/Work preference", ->
    element(By.id('submit')).click()


  ########################
  # --- Expectations --- #
  ########################

  @Then 'I should see my lottery number on the confirmation page', ->
    lotteryNumberMarkup = element(By.id('lottery_number'))
    @expect(lotteryNumberMarkup.isPresent()).to.eventually.equal(true)

  @Then 'I should be on the login page with the email confirmation popup', ->
    confirmationPopup = element(By.id('confirmation_needed'))
    @expect(confirmationPopup.isPresent()).to.eventually.equal(true)

  @Then 'I should still see the single Live in San Francisco preference selected', ->
    liveInSf = element(By.id('preferences-liveInSf'))
    browser.wait(EC.elementToBeSelected(liveInSf), 5000)

  @Then 'I should still see the preference options and uploader input visible', ->
    # there are multiple liveInSf_household_members, click the visible one
    liveInSfMember = element.all(By.id('liveInSf_household_member')).filter((elem) ->
      elem.isDisplayed()
    ).first()
    # expect the member selection field to still be there
    @expect(liveInSfMember.isPresent()).to.eventually.equal(true)

  @Then 'I should see proof uploaders for rent burden files', ->
    # expect the rentBurdenPreference component to render with the proof uploaders inside, rather than the dashboard
    uploader = element(By.model('$ctrl.proofDocument.file.name'))
    @expect(uploader.isPresent()).to.eventually.equal(true)

  @Then 'I should see my draft application with a Continue Application button', ->
    continueApplication = element(By.cssContainingText('.feed-item-action a', 'Continue Application'))
    @expect(continueApplication.isPresent()).to.eventually.equal(true)

  @Then 'I should see my name, DOB, email all displayed as expected', ->
    appName = element(By.id('full-name'))
    @expect(appName.getText()).to.eventually.equal('JANE DOE')
    appDob = element(By.id('dob'))
    @expect(appDob.getText()).to.eventually.equal('2/22/1990')
    appEmail = element(By.id('email'))
    @expect(appEmail.getText()).to.eventually.equal(sessionEmail.toUpperCase())

  @Then 'I should see my name, DOB, email, COP and DTHP options all displayed as expected', ->
    appName = element(By.id('full-name'))
    @expect(appName.getText()).to.eventually.equal('JANE DOE')
    appDob = element(By.id('dob'))
    @expect(appDob.getText()).to.eventually.equal('2/22/1990')
    appEmail = element(By.id('email'))
    @expect(appEmail.getText()).to.eventually.equal(sessionEmail.toUpperCase())
    certOfPref = element(By.cssContainingText('.info-item_name', 'Certificate of Preference (COP)'))
    @expect(certOfPref.isPresent()).to.eventually.equal(true)
    DTHP = element(By.cssContainingText('.info-item_name', 'Displaced Tenant Housing Preference (DTHP)'))
    @expect(DTHP.isPresent()).to.eventually.equal(true)

  ###################################
  # --- Error case expectations --- #
  ###################################

  # helper functions
  expectAlertBox = (context, errorText = "You'll need to resolve any errors") ->
    alertBox = element(By.cssContainingText('.alert-box', errorText))
    context.expect(alertBox.isPresent()).to.eventually.equal(true)

  expectError = (context, errorText) ->
    error = element(By.cssContainingText('.error', errorText))
    context.expect(error.isPresent()).to.eventually.equal(true)

  @Then 'I should see name field errors on the Name page', ->
    expectAlertBox(@)
    expectError(@, 'Please enter a First Name')

  @Then 'I should see DOB field errors on the Name page', ->
    expectAlertBox(@)
    expectError(@, 'Please enter a valid Date of Birth')

  @Then 'I should see an address error on the Contact page', ->
    expectAlertBox(@)
    expectError(@, 'This address was not found.')

  @Then 'I should see an error about selecting an option', ->
    expectAlertBox(@, 'Please select and complete one of the options below in order to continue')
    expectError(@, 'Please select one of the options above')
