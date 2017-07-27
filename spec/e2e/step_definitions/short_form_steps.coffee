World = require('../world.coffee').World
Chance = require('chance')
chance = new Chance()
EC = protractor.ExpectedConditions
remote = require('selenium-webdriver/remote')

# QA "280 Fell"
listingId = 'a0W0P00000DZTkAUAX'
sessionEmail = chance.email()
janedoeEmail = chance.email()
accountPassword = 'password123'

# reusable functions
fillOutNamePage = (fullName, opts = {}) ->
  firstName = fullName.split(' ')[0]
  lastName  = fullName.split(' ')[1]
  month = opts.month || '02'
  day = opts.day || '22'
  year = opts.year || '1990'

  element(By.model('applicant.firstName')).clear().sendKeys(firstName)
  element(By.model('applicant.lastName')).clear().sendKeys(lastName)
  element(By.model('applicant.dob_month')).clear().sendKeys(month)
  element(By.model('applicant.dob_day')).clear().sendKeys(day)
  element(By.model('applicant.dob_year')).clear().sendKeys(year)
  submitPage()

fillOutContactPage = (opts = {}) ->
  opts.address1 ||= '4053 18th St.'
  opts.city ||= 'San Francisco'
  opts.workInSf ||= 'yes'
  element(By.model('applicant.phone')).clear().sendKeys('2222222222')
  element(By.model('applicant.phoneType')).sendKeys('home')
  element(By.model('applicant.email')).clear().sendKeys(opts.email) if opts.email
  element(By.id('applicant_home_address_address1')).clear().sendKeys(opts.address1)
  element(By.id('applicant_home_address_city')).clear().sendKeys(opts.city)
  element(By.id('applicant_home_address_state')).sendKeys('california')
  element(By.id('applicant_home_address_zip')).clear().sendKeys('94114')
  if opts.workInSf == 'yes'
    element(By.id('workInSf_yes')).click()
  else
    element(By.id('workInSf_no')).click()
  submitPage()

fillOutHouseholdMemberForm = (opts = {}) ->
  opts.city ||= 'San Francisco'
  opts.workInSf ||= 'no'
  if opts.fullName
    fullName = opts.fullName
    firstName = fullName.split(' ')[0]
    lastName  = fullName.split(' ')[1]
    element(By.model('householdMember.firstName')).clear().sendKeys(firstName)
    element(By.model('householdMember.lastName')).clear().sendKeys(lastName)
    element(By.model('householdMember.dob_month')).clear().sendKeys('10')
    element(By.model('householdMember.dob_day')).clear().sendKeys('15')
    element(By.model('householdMember.dob_year')).clear().sendKeys('1985')
  if opts.address1
    element(By.id('hasSameAddressAsApplicant_no')).click()
    element(By.id('householdMember_home_address_address1')).clear().sendKeys(opts.address1)
    element(By.id('householdMember_home_address_city')).clear().sendKeys(opts.city)
    element(By.id('householdMember_home_address_state')).sendKeys('california')
    element(By.id('householdMember_home_address_zip')).clear().sendKeys('94114')
  else
    element(By.id('hasSameAddressAsApplicant_yes')).click()
  if opts.workInSf == 'yes'
    element(By.id('workInSf_yes')).click()
  else
    element(By.id('workInSf_no')).click()
  element(By.model('householdMember.relationship')).sendKeys('Cousin')
  submitPage()

fillOutSurveyPage = ->
  element(By.id('referral_newspaper')).click()
  submitPage()

getSelectedLiveMember = () ->
  liveInSfMember = element.all(By.id('liveInSf_household_member')).filter((elem) ->
    elem.isDisplayed()
  ).first()

submitPage = ->
  element(By.id('submit')).click()

checkCheckbox = (checkboxId, callback) ->
  checkbox = element(By.id(checkboxId))
  checkbox.isSelected().then (selected) ->
    checkbox.click() unless selected
    callback() if callback

optOutAndSubmit = ->
  # opt out + submit preference page (e.g. NRHP, Live/Work)
  checkCheckbox('preference-optout', -> submitPage())

getUrl = (url) ->
  browser.get(url)

submitPage = () ->
  element(By.id('submit')).click()

module.exports = ->
  # import global cucumber options
  @World = World

  @Given 'I go to the first page of the Test Listing application', ->
    url = "/listings/#{listingId}/apply/name"
    getUrl(url)

  @Given 'I have a confirmed account', ->
    # confirm the account
    browser.ignoreSynchronization = true
    url = "/api/v1/account/confirm/?email=#{sessionEmail}"
    getUrl(url)
    browser.ignoreSynchronization = false

  @When /^I hit the Next button "([^"]*)" times$/, (buttonClicks) ->
    i = parseInt(buttonClicks)
    while i > 0
      submitPage()
      i--

  @When /^I fill out the Name page as "([^"]*)"$/, (fullName) ->
    fillOutNamePage(fullName)

  @When 'I submit the Name page with my account info', ->
    submitPage()

  @When 'I fill out the Contact page with a non-SF address, yes to WorkInSF', ->
    fillOutContactPage({email: janedoeEmail, address1: '1120 Mar West G', city: 'Tiburon'})

  @When 'I fill out the Contact page with a non-SF address, no WorkInSF', ->
    fillOutContactPage({email: janedoeEmail, address1: '1120 Mar West G', city: 'Tiburon', workInSf: 'no'})

  @When 'I fill out the Contact page with an address (non-NRHP match), no WorkInSF', ->
    fillOutContactPage({email: janedoeEmail, workInSf: 'no'})

  @When 'I fill out the Contact page with an address (non-NRHP match) and WorkInSF', ->
    fillOutContactPage({email: janedoeEmail})

  @When 'I fill out the Contact page with an address (NRHP match) and WorkInSF', ->
    fillOutContactPage({email: janedoeEmail, address1: '1222 Harrison St.'})

  @When 'I fill out the Contact page with my account email, an address (non-NRHP match) and WorkInSF', ->
    fillOutContactPage()

  @When 'I confirm my address', ->
    element(By.id('confirmed_home_address_yes')).click()
    submitPage()

  @When 'I confirm their address', ->
    element(By.id('confirmed_home_address_yes')).click()
    submitPage()

  @When 'I don\'t indicate an alternate contact', ->
    element(By.id('alternate_contact_none')).click()
    submitPage()

  @When 'I indicate I will live alone', ->
    element(By.id('live-alone')).click()

  @When 'I indicate living with other people', ->
    element(By.id('other-people')).click()
    # also skip past household-overview
    submitPage()

  @When 'I open the household member form', ->
    element(By.id('add-household-member')).click()

  @When 'I cancel the household member', ->
    browser.sleep(1000) # sometimes it says the button is not clickable, this helps?
    element(By.id('cancel-member')).click()

  @When 'I edit the last household member', ->
    element.all(By.cssContainingText('.edit-link', 'Edit')).filter((elem) ->
      elem.isDisplayed()
    ).last().click()

  @When /^I add another household member named "([^"]*)" with same address as primary$/, (fullName) ->
    browser.waitForAngular()
    element(By.id('add-household-member')).click().then ->
      fillOutHouseholdMemberForm({fullName: fullName})

  @When /^I add another household member named "([^"]*)" who lives at "([^"]*)"$/, (fullName, address1) ->
    browser.waitForAngular()
    element(By.id('add-household-member')).click().then ->
      fillOutHouseholdMemberForm({fullName: fullName, address1: address1})

  @When 'I change them to live inside SF, work in SF', ->
    fillOutHouseholdMemberForm({address1: '4053 18th St.', workInSf: 'yes'})

  @When 'I change them to live outside SF, work in SF', ->
    fillOutHouseholdMemberForm({address1: '1120 Mar West G', city: 'Tiburon', workInSf: 'yes'})

  @When /^I change their address to "([^"]*)"$/, (address1) ->
    fillOutHouseholdMemberForm({address1: address1})

  @When 'I indicate being done adding people', ->
    submitPage()

  @When 'I indicate living in public housing', ->
    element(By.id('hasPublicHousing_yes')).click()
    submitPage()

  @When 'I indicate not living in public housing', ->
    element(By.id('hasPublicHousing_no')).click()
    submitPage()

  @When /^I enter "([^"]*)" for my monthly rent$/, (monthlyRent) ->
    element(By.id('monthlyRent_0')).sendKeys(monthlyRent)
    submitPage()

  @When 'I indicate no priority', ->
    element(By.id('adaPrioritiesSelected_none')).click()
    submitPage()


  @When 'I continue past the Lottery Preferences intro', ->
    submitPage()

  @When 'I opt out of Assisted Housing preference', ->
    optOutAndSubmit()

  @When 'I don\'t choose COP/DTHP preferences', ->
    # skip preferences programs
    submitPage()

  @When 'I continue past the general lottery notice page', ->
    # skip general lottery notice
    submitPage()

  @When 'I opt out of Live/Work preference', ->
    optOutAndSubmit()

  @When 'I opt out of NRHP preference', ->
    optOutAndSubmit()

  @When /^I select "([^"]*)" for "([^"]*)" preference$/, (fullName, preference) ->
    checkCheckbox "preferences-#{preference}", ->
      element.all(By.id("#{preference}_household_member")).filter((elem) ->
        elem.isDisplayed()
      ).first().click()
      element.all(By.cssContainingText("##{preference}_household_member option", fullName)).filter((elem) ->
        elem.isDisplayed()
      ).first().click()

  @When 'I go to the income page', ->
    submitPage()

  @When 'I click the Live in the Neighborhood checkbox', ->
    checkCheckbox('preferences-neighborhoodResidence')

  @When 'I click the Live or Work in SF checkbox', ->
    checkCheckbox('preferences-liveWorkInSf')

  @When 'I open the Live or Work in SF dropdown', ->
    checkCheckbox('liveWorkPrefOption')

  @When 'I select the Live in SF preference', ->
    element(By.cssContainingText('option', 'Live in San Francisco')).click()

  @When 'I select the Work in SF preference', ->
    element(By.cssContainingText('option', 'Work in San Francisco')).click()

  @When /^I select "([^"]*)" for "([^"]*)" in Live\/Work preference$/, (fullName, preference) ->
    # select either Live or Work preference in the combo Live/Work checkbox
    checkCheckbox 'preferences-liveWorkInSf', ->
      element(By.id('liveWorkPrefOption')).click()
      element(By.cssContainingText('option', preference)).click()
      pref = (if preference == 'Live in San Francisco' then 'liveInSf' else 'workInSf')
      # there are multiple liveInSf_household_members, click the visible one
      element.all(By.id("#{pref}_household_member")).filter((elem) ->
        elem.isDisplayed()
      ).first().click()
      # there are multiple Jane Doe options, click the visible one matching fullName
      element.all(By.cssContainingText('option', fullName)).filter((elem) ->
        elem.isDisplayed()
      ).first().click()

  @When /^I upload a "([^"]*)" as my proof of preference for "([^"]*)"$/, (documentType, preference) ->
    # open the proof option selector and pick the indicated documentType
    element.all(By.id("#{preference}_proofDocument")).filter((elem) ->
      elem.isDisplayed()
    ).first().click()
    element.all(By.cssContainingText('option', documentType)).filter((elem) ->
      elem.isDisplayed()
    ).first().click()

    # need this for uploading file to sauce labs
    browser.setFileDetector new remote.FileDetector()

    filePath = "#{process.env.PWD}/public/images/logo-city.png"
    element.all(By.css('input[type="file"]')).then( (items) ->
      items[0].sendKeys(filePath)
    )
    browser.sleep(5000)

  @When 'I click the Next button on the Live/Work Preference page', ->
    submitPage()

  @When 'I click the Next button on the Live in the Neighborhood page', ->
    submitPage()

  @When 'I go back to the Contact page', ->
    element(By.cssContainingText('.progress-nav_item', 'You')).click()
    submitPage()

  @When /^I change WorkInSF to "([^"]*)"$/, (workInSf) ->
    if workInSf == 'Yes'
      element(By.id('workInSf_yes')).click()
    else
      element(By.id('workInSf_no')).click()

  @When 'I go back to the Household page', ->
    element(By.cssContainingText('.progress-nav_item', 'Household')).click()

  @When 'I go back to the Live/Work preference page', ->
    element(By.cssContainingText('.progress-nav_item', 'Preferences')).click()
    # skip intro
    submitPage()

  @When 'I go back to the Live/Work preference page, skipping NRHP if exists', ->
    element(By.cssContainingText('.progress-nav_item', 'Preferences')).click()
    # skip intro
    submitPage()
    # skip NRHP (if exists)
    if element(By.id('preferences-neighborhoodResidence'))
      submitPage()

  @When 'I select Rent Burdened Preference', ->
    checkCheckbox('preferences-rentBurden')

  @When 'I submit my preferences', ->
    submitPage()

  @When 'I indicate having vouchers', ->
    element(By.id('householdVouchersSubsidies_yes')).click()
    submitPage()

  @When 'I do not indicate having vouchers', ->
    element(By.id('householdVouchersSubsidies_no')).click()
    submitPage()

  @When /^I fill out my income as "([^"]*)"/, (income) ->
    element(By.id('incomeTotal')).clear().sendKeys(income)
    element(By.id('per_year')).click()
    submitPage()

  @When 'I fill out the optional survey', ->
    fillOutSurveyPage()

  @When 'I confirm details on the review page', ->
    submitPage()

  @When 'I continue confirmation without signing in', ->
    element(By.id('confirm_no_account')).click()

  @When 'I agree to the terms and submit', ->
    element(By.id('terms_yes')).click()
    submitPage()

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
    submitPage()
    browser.waitForAngular()

  @When /^I wait "([^"]*)" seconds/, (delay) ->
    # pause before continuing
    delay = parseInt(delay) * 1000
    browser.sleep(delay)

  @When 'I sign in', ->
    signInUrl = "/sign-in"
    getUrl(signInUrl)
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

  @When /^I navigate to the "([^"]*)" section$/, (section) ->
    element.all(By.css('.progress-nav'))
      .all(By.linkText(section.toUpperCase()))
      .first()
      .click()
    browser.waitForAngular()

  @When 'I wait', ->
    browser.pause()

  #######################
  # --- Error cases --- #
  #######################

  @When "I don't fill out the Name page", ->
    submitPage()

  @When "I fill out the Name page with an invalid DOB", ->
    fillOutNamePage( 'Jane Doe', {
      month: '12'
      day: '33'
      year: '2019'
    })

  @When "I fill out the Contact page with an address that isn't found", ->
    fillOutContactPage({email: janedoeEmail, address1: '38383 Philz Way'})

  @When 'I fill out the household member form with missing data', ->
    # don't fill anything out and just submit
    submitPage()


  ########################
  # --- Expectations --- #
  ########################

  @Then 'I should see the Live Preference', ->
    livePref = element.all(By.cssContainingText('strong.form-label', 'Live in San Francisco Preference')).filter((elem) ->
      elem.isDisplayed()
    ).first()
    @expect(livePref.isPresent()).to.eventually.equal(true)

  @Then 'I should see the Work Preference', ->
    workPref = element.all(By.cssContainingText('strong.form-label', 'Work in San Francisco Preference')).filter((elem) ->
      elem.isDisplayed()
    ).first()
    @expect(workPref.isPresent()).to.eventually.equal(true)

  @Then 'I should see the Live and Work Preferences', ->
    liveWorkPref = element.all(By.cssContainingText('strong.form-label', 'Live or Work in San Francisco Preference')).filter((elem) ->
      elem.isDisplayed()
    ).first()
    @expect(liveWorkPref.isPresent()).to.eventually.equal(true)

  @Then 'I should see the Preferences Programs screen', ->
    certificateOfPreferenceLabel = element(By.cssContainingText('strong.form-label', 'Certificate of Preference (COP)'))
    @expect(certificateOfPreferenceLabel.isPresent()).to.eventually.equal(true)

  @Then 'I should see the successful file upload info', ->
    attachmentUploaded = element.all(By.id('successful-upload')).filter((elem) ->
      elem.isDisplayed()
    ).first()
    @expect(attachmentUploaded.isPresent()).to.eventually.equal(true)

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
    liveInSfMember = getSelectedLiveMember()
    # expect the member selection field to still be there
    @expect(liveInSfMember.isPresent()).to.eventually.equal(true)

  @Then 'I should see proof uploaders for rent burden files', ->
    # expect the rentBurdenPreference component to render with the proof uploaders inside, rather than the dashboard
    uploader = element(By.model('$ctrl.proofDocument.file.name'))
    @expect(uploader.isPresent()).to.eventually.equal(true)

  @Then /^I should be on the "([^"]*)" preference page$/, (preference) ->
    preference = element(By.cssContainingText('.form-label', preference))
    @expect(preference.isPresent()).to.eventually.equal(true)

  @Then /^I should see "([^"]*)" in the preference dropdown and not "([^"]*)"$/, (eligible, ineligible) ->
    eligible = eligible.split(', ')
    ineligible = ineligible.split(', ')
    eligible.forEach (fullName) =>
      opt = element(By.cssContainingText('option', fullName))
      @expect(opt.isPresent()).to.eventually.equal(true)
    ineligible.forEach (fullName) =>
      opt = element(By.cssContainingText('option', fullName))
      @expect(opt.isPresent()).to.eventually.equal(false)

  @Then 'I should see my draft application with a Continue Application button', ->
    continueApplication = element(By.cssContainingText('.feed-item-action a', 'Continue Application'))
    @expect(continueApplication.isPresent()).to.eventually.equal(true)

  @Then 'I should see my name, DOB, email, Live in SF Preference, COP and DTHP options all displayed as expected', ->
    appName = element(By.id('full-name'))
    @expect(appName.getText()).to.eventually.equal('JANE DOE')
    appDob = element(By.id('dob'))
    @expect(appDob.getText()).to.eventually.equal('2/22/1990')
    appEmail = element(By.id('email'))
    @expect(appEmail.getText()).to.eventually.equal(sessionEmail.toUpperCase())
    liveInSf = element(By.cssContainingText('.info-item_name', 'Live in San Francisco Preference'))
    @expect(liveInSf.isPresent()).to.eventually.equal(true)
    certOfPref = element(By.cssContainingText('.info-item_name', 'Certificate of Preference (COP)'))
    @expect(certOfPref.isPresent()).to.eventually.equal(true)
    DTHP = element(By.cssContainingText('.info-item_name', 'Displaced Tenant Housing Preference (DTHP)'))
    @expect(DTHP.isPresent()).to.eventually.equal(true)

  @Then 'I should see the Live in the Neighborhood checkbox un-checked', ->
    checkbox = element(By.id('preferences-neighborhoodResidence'))
    @expect(checkbox.isSelected()).to.eventually.equal(false)

  @Then 'I should see the Live or Work in SF checkbox un-checked', ->
    checkbox = element(By.id('preferences-liveWorkInSf'))
    @expect(checkbox.isSelected()).to.eventually.equal(false)

  @Then /^I should see "([^"]*)" preference claimed for "([^"]*)"$/, (preference, name) ->
    claimedPreference = element(By.cssContainingText('.info-item_name', preference))
    @expect(claimedPreference.isPresent()).to.eventually.equal(true)
    claimedMember = element(By.cssContainingText('.info-item_note', name))
    @expect(claimedMember.isPresent()).to.eventually.equal(true)

    preferenceMember = element(By.cssContainingText('.info-item_note', name))
    @expect(preferenceMember.isPresent()).to.eventually.equal(true)

  @Then 'I should see the general lottery notice on the review page', ->
    claimedPreference = element(By.cssContainingText('.info-item_name', 'You will be in the general lottery'))
    @expect(claimedPreference.isPresent()).to.eventually.equal(true)


  ###################################
  # --- Error case expectations --- #
  ###################################

  # helper functions
  expectAlertBox = (context, errorText = "You'll need to resolve any errors") ->
    alertBox = element(By.cssContainingText('.alert-box', errorText))
    context.expect(alertBox.isPresent()).to.eventually.equal(true)

  expectError = (context, errorText, className = '.error') ->
    error = element(By.cssContainingText(className, errorText))
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

  @Then 'I should see an error about uploading proof', ->
    expectAlertBox(@,)
    expectError(@, 'Please upload a valid document')

  @Then 'I should see an error on the household member form', ->
    browser.waitForAngular()
    expectAlertBox(@)
    expectError(@, 'Please enter a First Name')

  @Then 'I should see an error about household size being too big', ->
    browser.waitForAngular()
    expectAlertBox(@, 'Unfortunately it appears you do not qualify')
    expectError(@, 'Your household size is too big', '.c-alert')

  @Then 'I should see an error about household income being too low', ->
    browser.waitForAngular()
    expectAlertBox(@, 'Unfortunately it appears you do not qualify')
    expectError(@, 'Your household income is too low', '.c-alert')

  @Then 'I should see an error about household income being too high', ->
    browser.waitForAngular()
    expectAlertBox(@, 'Unfortunately it appears you do not qualify')
    expectError(@, 'Your household income is too high', '.c-alert')

  @Then 'I should land on the optional survey page', ->
    surveyTitle = element(By.cssContainingText('h2.app-card_question', 'Help us ensure we are meeting our goal'))
    @expect(surveyTitle.isPresent()).to.eventually.equal(true)
