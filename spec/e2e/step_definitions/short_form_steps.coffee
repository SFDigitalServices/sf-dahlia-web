World = require('../world.coffee').World
Chance = require('chance')
chance = new Chance()
EC = protractor.ExpectedConditions
remote = require('selenium-webdriver/remote')

# QA "Abaca"
listingId = 'a0W0P00000DZKPdUAP' # 280 Fell: 'a0W0P00000DZTkAUAX'
sessionEmail = chance.email()
janedoeEmail = chance.email()
accountPassword = 'password123'

sampleApplication = {
  nameInfo: {
    firstName: 'Coleman',
    middleName: 'Mystery',
    lastName: 'Francis',
    month: '11',
    day: '22',
    year: '1990',
  },
  contactInfo: {
    phone: '(222) 222-2222',
    phoneType: 'Home',
    phone2: '(444) 444-4444',
    phoneType2: 'Cell',
    email: chance.email(),
    address1: '4053 18th St',
    address2: 'Suite 1979',
    condensedAddress: '4053 18TH ST STE 1979',
    city: 'SAN FRANCISCO',
    state: 'CA',
    zip: '94114-2535',
    sendMailToDifferentAddress: 'yes',
    mailAddress1: '123 Main St.',
    mailAddress2: 'Suite 300',
    condensedMailAddress: '123 Main St. Suite 300',
    mailCity: 'SAN FRANCISCO',
    mailState: 'CA',
    mailZip: '94110',
    workInSf: 'yes',
  },
  password: 'test1234',
  alternateContact: {
    firstName: 'Chet',
    lastName: 'Beansworthy',
    phone: '(333) 333-3333',
    email: 'chet@eurignfjnbgjrio.uifndj',
    address1: '2601 Mission St.',
    address2: 'Suite 300',
    condensedAddress: '2601 Mission St. Suite 300',
    city: 'SAN FRANCISCO',
    state: 'CA',
    zip: '94110'
  },
  householdMember: {
    firstName: 'Frampton',
    middleName: 'Blue',
    lastName: 'Soapmaster',
    birthMonth: '10',
    birthDay: '11',
    birthYear: '1981',
    address1: '429 Castro St.',
    address2: 'Door 1',
    condensedAddress: '429 CASTRO ST DOOR 1',
    city: 'SAN FRANCISCO',
    state: 'CA',
    zip: '94114-2019',
    workInSf: 'yes',
    relationship: 'Cousin',
  },
  publicHousing: 'no',
  monthlyRent: '2,500.00',
  income: '33,333.00',
  neighborhoodPref: 'true',
  rentBurdenPref: 'true',
  copPref: 'true',
  dthpPref: 'true'
}

# reusable functions
fillOutNamePage = (opts = {}) ->
  element(By.model('applicant.firstName')).clear().sendKeys(opts.firstName)
  element(By.model('applicant.middleName')).clear().sendKeys(opts.middleName)
  element(By.model('applicant.lastName')).clear().sendKeys(opts.lastName)
  element(By.model('applicant.dob_month')).clear().sendKeys(opts.month)
  element(By.model('applicant.dob_day')).clear().sendKeys(opts.day)
  element(By.model('applicant.dob_year')).clear().sendKeys(opts.year)
  submitPage()

fillOutContactPage = (opts = {}) ->
  element(By.model('applicant.phone')).clear().sendKeys(opts.phone)
  element(By.model('applicant.phoneType')).sendKeys(opts.phoneType)
  element(By.model('applicant.additionalPhone')).click()
  element(By.model('applicant.alternatePhone')).clear().sendKeys(opts.phone2)
  element(By.model('applicant.alternatePhoneType')).sendKeys(opts.phoneType2)
  element(By.model('applicant.email')).clear().sendKeys(opts.email)
  element(By.id('applicant_home_address_address1')).clear().sendKeys(opts.address1)
  element(By.id('applicant_home_address_address2')).clear().sendKeys(opts.address2)
  element(By.id('applicant_home_address_city')).clear().sendKeys(opts.city)
  element(By.id('applicant_home_address_state')).sendKeys(opts.state)
  element(By.id('applicant_home_address_zip')).clear().sendKeys(opts.zip)
  element(By.model('applicant.hasAltMailingAddress')).click()
  element(By.id('applicant_mailing_address_address1')).clear().sendKeys(opts.mailAddress1)
  element(By.id('applicant_mailing_address_address2')).clear().sendKeys(opts.mailAddress2)
  element(By.id('applicant_mailing_address_city')).clear().sendKeys(opts.mailCity)
  element(By.id('applicant_mailing_address_state')).sendKeys(opts.mailState)
  element(By.id('applicant_mailing_address_zip')).clear().sendKeys(opts.mailZip)
  if opts.workInSf == 'yes'
    element(By.id('workInSf_yes')).click()
  else
    element(By.id('workInSf_no')).click()
  submitPage()

fillOutHouseholdMemberForm = (opts = {}) ->
  opts.address2 ||= sampleApplication.householdMember.address2
  opts.city ||= sampleApplication.householdMember.city
  opts.state ||= sampleApplication.householdMember.state
  opts.zip ||= sampleApplication.householdMember.zip
  opts.workInSf ||= 'no'
  opts.zip ||= sampleApplication.householdMember.zip

  if opts.firstName
    element(By.model('householdMember.firstName')).clear().sendKeys(opts.firstName)
    if opts.middleName
      element(By.model('householdMember.middleName')).clear().sendKeys(opts.middleName)
    element(By.model('householdMember.lastName')).clear().sendKeys(opts.lastName)
  if opts.birthMonth
    element(By.model('householdMember.dob_month')).clear().sendKeys(opts.birthMonth)
    element(By.model('householdMember.dob_day')).clear().sendKeys(opts.birthDay)
    element(By.model('householdMember.dob_year')).clear().sendKeys(opts.birthYear)
  if opts.address1
    element(By.id('hasSameAddressAsApplicant_no')).click()
    element(By.id('householdMember_home_address_address1')).clear().sendKeys(opts.address1)
    if opts.address2
      element(By.id('householdMember_home_address_address2')).clear().sendKeys(opts.address2)
    element(By.id('householdMember_home_address_city')).clear().sendKeys(opts.city)
    element(By.id('householdMember_home_address_state')).sendKeys(opts.state)
    element(By.id('householdMember_home_address_zip')).clear().sendKeys(opts.zip)
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

  @When 'I confirm the account for the default email', ->
    browser.ignoreSynchronization = true
    url = "/api/v1/account/confirm/?email=#{sampleApplication.contactInfo.email}"
    getUrl(url)
    browser.ignoreSynchronization = false

  @When /^I hit the Next button "([^"]*)" times$/, (buttonClicks) ->
    i = parseInt(buttonClicks)
    while i > 0
      submitPage()
      i--

  @When 'I fill out the Name page with default info', ->
    fillOutNamePage(sampleApplication.nameInfo)

  @When /^I fill out the Name page as "([^"]*)"$/, (fullName) ->
    opts = sampleApplication.nameInfo
    opts.firstName = fullName.split(' ')[0]
    opts.lastName = fullName.split(' ')[1]
    fillOutNamePage(opts)

  @When 'I submit the page', ->
    submitPage()

  @When 'I fill out the Contact page with default info', ->
    fillOutContactPage(sampleApplication.contactInfo)

  @When 'I fill out the Contact page with a non-SF address, yes to WorkInSF', ->
    opts = sampleApplication.contactInfo
    opts.email = janedoeEmail
    opts.address1 = '1120 Mar West G'
    opts.city = 'Tiburon'
    fillOutContactPage(opts)

  @When 'I fill out the Contact page with a non-SF address, no WorkInSF', ->
    opts = sampleApplication.contactInfo
    opts.email = janedoeEmail
    opts.address1 = '1120 Mar West G'
    opts.city = 'Tiburon'
    opts.workInSf = 'no'
    fillOutContactPage(opts)

  @When 'I fill out the Contact page with an address (non-NRHP match), no WorkInSF', ->
    opts = sampleApplication.contactInfo
    opts.email = janedoeEmail
    opts.workInSf = 'no'
    fillOutContactPage(opts)

  @When 'I fill out the Contact page with an address (non-NRHP match) and WorkInSF', ->
    opts = sampleApplication.contactInfo
    opts.email = janedoeEmail
    fillOutContactPage(opts)

  @When 'I fill out the Contact page with an address (NRHP match) and WorkInSF', ->
    opts = sampleApplication.contactInfo
    opts.email = janedoeEmail
    opts.address1 = '1222 Harrison St.'
    fillOutContactPage(opts)

  @When 'I fill out the Contact page with my account email, an address (non-NRHP match) and WorkInSF', ->
    fillOutContactPage(sampleApplication.contactInfo)

  @When 'I confirm my address', ->
    element(By.id('confirmed_home_address_yes')).click()
    submitPage()

  @When 'I confirm their address', ->
    element(By.id('confirmed_home_address_yes')).click()
    submitPage()

  @When 'I fill out my alternate contact\'s name', ->
    element(By.model('alternateContact.firstName')).clear().sendKeys(sampleApplication.alternateContact.firstName)
    element(By.model('alternateContact.lastName')).clear().sendKeys(sampleApplication.alternateContact.lastName)
    submitPage()

  @When 'I fill out my alternate contact\'s info', ->
    element(By.model('alternateContact.phone')).clear().sendKeys(sampleApplication.alternateContact.phone)
    element(By.model('alternateContact.email')).clear().sendKeys(sampleApplication.alternateContact.email)
    element(By.id('alternateContact_mailing_address_address1')).clear().sendKeys(sampleApplication.alternateContact.address1)
    element(By.id('alternateContact_mailing_address_address2')).clear().sendKeys(sampleApplication.alternateContact.address2)
    element(By.id('alternateContact_mailing_address_city')).clear().sendKeys(sampleApplication.alternateContact.city)
    element(By.id('alternateContact_mailing_address_state')).sendKeys(sampleApplication.alternateContact.state)
    element(By.id('alternateContact_mailing_address_zip')).clear().sendKeys(sampleApplication.alternateContact.zip)
    submitPage()

  @When 'I select a friend as an alternate contact', ->
    element(By.id('alternateContactType_friend')).click()
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

  @When 'I add a default household member', ->
    browser.waitForAngular()
    element(By.id('add-household-member')).click().then ->
      fillOutHouseholdMemberForm(sampleApplication.householdMember)

  @When /^I add another household member named "([^"]*)" with same address as primary$/, (fullName) ->
    browser.waitForAngular()
    firstName = fullName.split(' ')[0]
    lastName  = fullName.split(' ')[1]
    element(By.id('add-household-member')).click().then ->
      fillOutHouseholdMemberForm({firstName: firstName, lastName: lastName})

  @When /^I add another household member named "([^"]*)" who lives at "([^"]*)"$/, (fullName, address1) ->
    browser.waitForAngular()
    firstName = fullName.split(' ')[0]
    lastName  = fullName.split(' ')[1]
    element(By.id('add-household-member')).click().then ->
      fillOutHouseholdMemberForm({firstName: firstName, lastName: lastName, address1: address1})

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

  @When 'I indicate being a veteran', ->
    element(By.id('hasMilitaryService_yes')).click()
    submitPage()

  @When 'I indicate having a developmental disability', ->
    element(By.id('hasDevelopmentalDisability_yes')).click()
    submitPage()

  @When 'I indicate need ADA features for vision and hearing', ->
    element(By.id('adaPrioritiesSelected_vision-impaired')).click()
    element(By.id('adaPrioritiesSelected_hearing-impaired')).click()
    submitPage()

  @When /^I enter "([^"]*)" for my monthly rent$/, (monthlyRent) ->
    element(By.id('monthlyRent_0')).sendKeys(monthlyRent)
    submitPage()

  @When /^I enter "([^"]*)" for the rent of my housemate$/, (monthlyRent) ->
    element(By.id('monthlyRent_1')).sendKeys(monthlyRent)
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

  @When 'I upload rent burdened proof', ->
    element.all(By.cssContainingText('a', 'Start Upload')).then( (items) ->
      items[0].click()
    )

    # need this for uploading file to sauce labs
    browser.setFileDetector new remote.FileDetector()

    filePath = "#{process.env.PWD}/public/images/logo-city.png"
    element.all(By.css('input[type="file"]')).then( (items) ->
      items[0].sendKeys(filePath)
    )

    element.all(By.cssContainingText('option', 'Money order')).filter((elem) ->
      elem.isDisplayed()
    ).first().click()

    element.all(By.css('input[type="file"]')).then( (items) ->
      items[0].sendKeys(filePath)
    )
    browser.sleep(5000)
    element.all(By.css('.button')).filter((elem) ->
      elem.isDisplayed()
    ).first().click()

  @When 'I click the Next button on the Live/Work Preference page', ->
    submitPage()

  @When 'I click the Next button on the Rent Burdened Preference page', ->
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

  @When 'I go to the review page', ->
    element(By.cssContainingText('.a', 'Review')).click()

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

  @When 'I complete my account info', ->
    element(By.id('auth_email_confirmation')).sendKeys(sampleApplication.contactInfo.email)
    element(By.id('auth_password')).sendKeys(sampleApplication.password)
    element(By.id('auth_password_confirmation')).sendKeys(sampleApplication.password)

  @When 'I fill out the default account info', ->
    element(By.id('auth_email')).sendKeys(sampleApplication.email)
    element(By.id('auth_email_confirmation')).sendKeys(sampleApplication.email)
    element(By.id('auth_password')).sendKeys(sampleApplication.password)
    element(By.id('auth_password_confirmation')).sendKeys(sampleApplication.password)

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

  @When 'I sign in with default info', ->
    signInUrl = "/sign-in"
    getUrl(signInUrl)
    element(By.id('auth_email')).sendKeys(sampleApplication.contactInfo.email)
    element(By.id('auth_password')).sendKeys(sampleApplication.password)
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
    fillOutNamePage( {
      firstName: 'Jane',
      lastName: 'Doe',
      month: '12',
      day: '33',
      year: '2019'
    })

  @When "I fill out the Contact page with an address that isn't found", ->
    opts = sampleApplication.contactInfo
    opts.address1 = '38383 Philz Way'
    fillOutContactPage(opts)

  @When 'I fill out the household member form with missing data', ->
    # don't fill anything out and just submit
    submitPage()


  ########################
  # --- Expectations --- #
  ########################

  @Then 'I should see my name and DOB', ->
    firstName = element(By.model('applicant.firstName'))
    @expect(firstName.getAttribute('value')).to.eventually.equal(sampleApplication.nameInfo.firstName)
    middleName = element(By.model('applicant.middleName'))
    @expect(middleName.getAttribute('value')).to.eventually.equal(sampleApplication.nameInfo.middleName)
    lastName = element(By.model('applicant.lastName'))
    @expect(lastName.getAttribute('value')).to.eventually.equal(sampleApplication.nameInfo.lastName)
    birthMonth = element(By.model('applicant.dob_month'))
    @expect(birthMonth.getAttribute('value')).to.eventually.equal(sampleApplication.nameInfo.month)
    birthDay = element(By.model('applicant.dob_day'))
    @expect(birthDay.getAttribute('value')).to.eventually.equal(sampleApplication.nameInfo.day)
    birthYear = element(By.model('applicant.dob_year'))
    @expect(birthYear.getAttribute('value')).to.eventually.equal(sampleApplication.nameInfo.year)

  @Then 'I should see my contact info', ->
    phone = element(By.model('applicant.phone'))
    @expect(phone.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.phone)
    phoneType = element(By.model('applicant.phoneType'))
    @expect(phoneType.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.phoneType)
    phone2 = element(By.model('applicant.alternatePhone'))
    @expect(phone2.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.phone2)
    phoneType2 = element(By.model('applicant.alternatePhoneType'))
    @expect(phoneType2.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.phoneType2)
    email = element(By.model('applicant.email'))
    @expect(email.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.email)
    address1 = element(By.id('applicant_home_address_address1'))
    @expect(address1.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.condensedAddress)
    city = element(By.id('applicant_home_address_city'))
    @expect(city.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.city)
    state = element(By.id('applicant_home_address_state'))
    @expect(state.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.state)
    zip = element(By.id('applicant_home_address_zip'))
    @expect(zip.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.zip)
    mailAddress1 = element(By.id('applicant_mailing_address_address1'))
    @expect(mailAddress1.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.condensedMailAddress)
    mailCity = element(By.id('applicant_mailing_address_city'))
    @expect(mailCity.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.mailCity)
    mailState = element(By.id('applicant_mailing_address_state'))
    @expect(mailState.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.mailState)
    mailZip = element(By.id('applicant_mailing_address_zip'))
    @expect(mailZip.getAttribute('value')).to.eventually.equal(sampleApplication.contactInfo.mailZip)
    workInSf = element(By.id('workInSf_yes'))
    if sampleApplication.contactInfo.workInSf == 'yes'
      @expect(workInSf.isSelected()).to.eventually.equal(true)
    else
      @expect(workInSf.isSelected()).to.eventually.equal(false)

  @Then 'I should see my alternate contact', ->
    friendChoice = element(By.id('alternateContactType_friend'))
    @expect(friendChoice.isSelected()).to.eventually.equal(true)

  @Then 'I should see the name of my alternate contact', ->
    firstName = element(By.model('alternateContact.firstName'))
    @expect(firstName.getAttribute('value')).to.eventually.equal(sampleApplication.alternateContact.firstName)
    lastName = element(By.model('alternateContact.lastName'))
    @expect(lastName.getAttribute('value')).to.eventually.equal(sampleApplication.alternateContact.lastName)

  @Then 'I should see the info of my alternate contact', ->
    phone = element(By.model('alternateContact.phone'))
    @expect(phone.getAttribute('value')).to.eventually.equal(sampleApplication.alternateContact.phone)
    email = element(By.model('alternateContact.email'))
    @expect(email.getAttribute('value')).to.eventually.equal(sampleApplication.alternateContact.email)
    address1 = element(By.id('alternateContact_mailing_address_address1'))
    @expect(address1.getAttribute('value')).to.eventually.equal(sampleApplication.alternateContact.condensedAddress)
    city = element(By.id('alternateContact_mailing_address_city'))
    @expect(city.getAttribute('value')).to.eventually.equal(sampleApplication.alternateContact.city)
    state = element(By.id('alternateContact_mailing_address_state'))
    @expect(state.getAttribute('value')).to.eventually.equal(sampleApplication.alternateContact.state)
    zip = element(By.id('alternateContact_mailing_address_zip'))
    @expect(zip.getAttribute('value')).to.eventually.equal(sampleApplication.alternateContact.zip)

  @Then 'I should see my household members', ->
    applicant = element.all(By.cssContainingText('p.info-item_name', sampleApplication.nameInfo.firstName)).filter((elem) ->
      elem.isDisplayed()
    ).first()
    @expect(applicant.isPresent()).to.eventually.equal(true)
    householdMember = element.all(By.cssContainingText('p.info-item_name', sampleApplication.householdMember.firstName)).filter((elem) ->
      elem.isDisplayed()
    ).first()
    @expect(householdMember.isPresent()).to.eventually.equal(true)

  @Then 'I should see the info of my household member', ->
    firstName = element(By.model('householdMember.firstName'))
    @expect(firstName.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.firstName)
    middleName = element(By.model('householdMember.middleName'))
    @expect(middleName.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.middleName)
    lastName = element(By.model('householdMember.lastName'))
    @expect(lastName.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.lastName)
    birthMonth = element(By.model('householdMember.dob_month'))
    @expect(birthMonth.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.birthMonth)
    birthDay = element(By.model('householdMember.dob_day'))
    @expect(birthDay.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.birthDay)
    birthYear = element(By.model('householdMember.dob_year'))
    @expect(birthYear.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.birthYear)
    birthYear = element(By.model('householdMember.dob_year'))
    @expect(birthYear.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.birthYear)
    address1 = element(By.id('householdMember_home_address_address1'))
    @expect(address1.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.condensedAddress)
    city = element(By.id('householdMember_home_address_city'))
    @expect(city.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.city)
    state = element(By.id('householdMember_home_address_state'))
    @expect(state.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.state)
    zip = element(By.id('householdMember_home_address_zip'))
    @expect(zip.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.zip)
    workInSf = element(By.id('workInSf_yes'))
    @expect(workInSf.isSelected()).to.eventually.equal(true)
    relationship = element(By.model('householdMember.relationship'))
    @expect(relationship.getAttribute('value')).to.eventually.equal(sampleApplication.householdMember.relationship)

  @Then 'I should see not living in public housing', ->
    notInPublicHousing = element(By.id('hasPublicHousing_no'))
    @expect(notInPublicHousing.isSelected()).to.eventually.equal(true)

  @Then /^I should see "([^"]*)" for my monthly rent and the rent of my housemate$/, (rent) ->
    myRent = element(By.id('monthlyRent_0'))
    @expect(myRent.getAttribute('value')).to.eventually.equal(sampleApplication.monthlyRent)
    theirRent = element(By.id('monthlyRent_1'))
    @expect(theirRent.getAttribute('value')).to.eventually.equal(sampleApplication.monthlyRent)

  @Then 'I should see veteran selected', ->
    veteran = element(By.id('hasMilitaryService_yes'))
    @expect(veteran.isSelected()).to.eventually.equal(true)

  @Then 'I should see having a developmental disability selected', ->
    disability = element(By.id('hasDevelopmentalDisability_yes'))
    @expect(disability.isSelected()).to.eventually.equal(true)

  @Then 'I should see need ADA features for vision and hearing', ->
    vision = element(By.id('adaPrioritiesSelected_vision-impaired'))
    @expect(vision.isSelected()).to.eventually.equal(true)
    hearing = element(By.id('adaPrioritiesSelected_hearing-impaired'))
    @expect(hearing.isSelected()).to.eventually.equal(true)

  @Then 'I should see not having vouchers', ->
    noVouchers = element(By.id('householdVouchersSubsidies_no'))
    @expect(noVouchers.isSelected()).to.eventually.equal(true)

  @Then /^I should see my income as "([^"]*)"$/, (income) ->
    myIncome = element(By.id('incomeTotal'))
    @expect(myIncome.getAttribute('value')).to.eventually.equal(sampleApplication.income)

  @Then 'I should see the Live in SF preference chosen with proof', ->
    livePref = element.all(By.cssContainingText('strong.form-label', 'Live in San Francisco Preference')).filter((elem) ->
      elem.isDisplayed()
    ).first()
    @expect(livePref.isPresent()).to.eventually.equal(true)


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
