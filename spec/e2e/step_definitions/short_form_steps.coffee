World = require('../world.coffee').World
Chance = require('chance')
chance = new Chance()
EC = protractor.ExpectedConditions
remote = require('selenium-webdriver/remote')

# import Page objects for interacting with short form pages
Pages = require('../pages/short-form/index').Pages

# QA "280 Fell"
listingId = 'a0W0P00000DZTkAUAX'
sessionEmail = chance.email()
janedoeEmail = chance.email()
accountPassword = 'password123'

# reusable functions
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

scrollToElement = (element) ->
  browser.actions().mouseMove(element).perform()

module.exports = ->
  # import global cucumber options
  @World = World

  # need this for uploading file to sauce labs
  browser.setFileDetector new remote.FileDetector()

  @Given 'I go to the first page of the Test Listing application', ->
    url = "/listings/#{listingId}/apply/name"
    getUrl(url)

  @When 'I try to navigate to the Favorites page', ->
    browser.waitForAngular()
    element.all(By.cssContainingText('a', 'My Favorites')).filter((elem) ->
      elem.isDisplayed()
    ).first().click()

  @When 'I cancel the modal pop-up', ->
    browser.waitForAngular()
    element(By.cssContainingText('button', 'Cancel')).click()

  @When 'I confirm the modal', ->
    browser.waitForAngular()
    element(By.cssContainingText('button', 'OK')).click()

  @Given 'I have a confirmed account', ->
    # confirm the account
    browser.ignoreSynchronization = true
    url = "/api/v1/account/confirm/?email=#{sessionEmail}"
    getUrl(url)
    browser.ignoreSynchronization = false

  @When /^I hit the Next button "([^"]*)" times?$/, (buttonClicks) ->
    i = parseInt(buttonClicks)
    while i > 0
      submitPage()
      i--

  @When /^I fill out the Name page as "([^"]*)"$/, (fullName) ->
    Pages.Name.fill({ fullName })

  @When 'I submit the Name page with my account info', ->
    submitPage()

  @When 'I fill out the Contact page with a non-SF address, yes to WorkInSF', ->
    Pages.Contact.fill({email: janedoeEmail, address1: '1120 Mar West G', city: 'Tiburon', workInSf: 'yes'})

  @When 'I fill out the Contact page with a non-SF address, no WorkInSF', ->
    Pages.Contact.fill({email: janedoeEmail, address1: '1120 Mar West G', city: 'Tiburon', workInSf: 'no'})

  @When 'I fill out the Contact page with an address (non-NRHP match), no WorkInSF', ->
    Pages.Contact.fill({email: janedoeEmail, workInSf: 'no'})

  @When 'I fill out the Contact page with an address (non-NRHP match) and WorkInSF', ->
    Pages.Contact.fill({email: janedoeEmail})

  @When 'I fill out the Contact page with an address (NRHP match) and WorkInSF', ->
    Pages.Contact.fill({email: janedoeEmail, address1: '1222 Harrison St.'})

  @When 'I fill out the Contact page with my account email, address (NRHP match), mailing address', ->
    Pages.Contact.fill({email: sessionEmail, address1: '1222 Harrison St.', address2: '#100', extra: true})

  @When 'I confirm my address', ->
    element(By.id('confirmed_home_address_yes')).click()
    submitPage()

  @When 'I confirm their address', ->
    element(By.id('confirmed_home_address_yes')).click()
    submitPage()

  @When 'I don\'t indicate an alternate contact', ->
    element(By.id('alternate_contact_none')).click()
    submitPage()

  @When 'I fill out an alternate contact', ->
    Pages.AlternateContact.fillAllSections()

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
      Pages.HouseholdMemberForm.fill({ fullName })

  @When /^I add another household member named "([^"]*)" who lives at "([^"]*)"$/, (fullName, address1) ->
    browser.waitForAngular()
    element(By.id('add-household-member')).click().then ->
      Pages.HouseholdMemberForm.fill({ fullName, address1 })

  @When 'I change them to live inside SF, work in SF', ->
    Pages.HouseholdMemberForm.fill({address1: '4053 18th St.', workInSf: 'yes'})

  @When 'I change them to live outside SF, work in SF', ->
    Pages.HouseholdMemberForm.fill({address1: '1120 Mar West G', city: 'Tiburon', workInSf: 'yes'})

  @When /^I change their address to "([^"]*)"$/, (address1) ->
    Pages.HouseholdMemberForm.fill({ address1 })

  @When 'I indicate being done adding people', ->
    submitPage()

  @When 'I indicate living in public housing', ->
    element(By.id('hasPublicHousing_yes')).click()
    submitPage()

  @When 'I indicate not living in public housing', ->
    element(By.id('hasPublicHousing_no')).click()
    submitPage()

  @When /^I enter "([^"]*)" for each of my monthly rents$/, (monthlyRent) ->
    element.all(By.css('.form-income_input')).each((elem) ->
      # we just fill out the same rent value for each rent input
      elem.sendKeys(monthlyRent)
    ).then ->
      submitPage()

  @When 'I indicate no ADA priority', ->
    checkCheckbox 'adaPrioritiesSelected_none', -> submitPage()

  @When 'I indicate ADA Mobility and Vision impairments', ->
    checkCheckbox 'adaPrioritiesSelected_mobility-impaired', ->
      checkCheckbox 'adaPrioritiesSelected_vision-impaired', ->
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
    prefCheckboxId = "preferences-#{preference}"
    scrollToElement(element(By.id(prefCheckboxId))).then ->
      checkCheckbox prefCheckboxId, ->
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

    filePath = "#{process.env.PWD}/app/assets/images/logo-city.png"
    element.all(By.css('input[type="file"]')).then( (items) ->
      items[0].sendKeys(filePath)
    )
    browser.sleep(5000)

  @When /^I upload a Copy of Lease and "([^"]*)" as my proof for Rent Burden$/, (documentType) ->
    filePath = "#{process.env.PWD}/app/assets/images/logo-portal.png"
    element(By.id('ngf-rentBurden_leaseFile')).sendKeys(filePath)
    browser.sleep(1000)

    # open the proof option selector and pick the indicated documentType
    element.all(By.id('rentBurden_rentDocument')).filter((elem) ->
      elem.isDisplayed()
    ).first().click()
    element.all(By.cssContainingText('option', documentType)).filter((elem) ->
      elem.isDisplayed()
    ).first().click()

    filePath = "#{process.env.PWD}/app/assets/images/logo-city.png"
    element(By.id('ngf-rentBurden_rentFile')).sendKeys(filePath)
    browser.sleep(3000)

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
    element(By.id('householdVouchersSubsidies_yes')).click().then ->
      submitPage()

  @When 'I do not indicate having vouchers', ->
    element(By.id('householdVouchersSubsidies_no')).click().then ->
      submitPage()

  @When /^I fill out my income as "([^"]*)"/, (income) ->
    incomeTotal = element(By.id('incomeTotal'))
    scrollToElement(incomeTotal).then ->
      incomeTotal.clear().sendKeys(income)
      element(By.id('per_year')).click().then ->
        submitPage()

  @When 'I fill out the optional survey', ->
    fillOutSurveyPage()

  @When 'I confirm details on the review page', ->
    submitPage()

  @When 'I continue confirmation without signing in', ->
    element(By.id('confirm_no_account')).click()

  @When 'I agree to the terms and submit', ->
    element(By.id('terms_yes')).click().then ->
      submitPage()

  @When 'I click the Save and Finish Later button', ->
    element(By.id('save_and_finish_later')).click()

  @When 'I click the Create Account button', ->
    createAccount = element(By.id('create-account'))
    scrollToElement(createAccount).then ->
      createAccount.click()

  @When 'I fill out my account info', ->
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
    getUrl('/my-applications')

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

  @When /^I wait "([^"]*)" seconds/, (delay) ->
    # pause before continuing
    delay = parseInt(delay) * 1000
    browser.sleep(delay)

  @When 'I wait', ->
    browser.pause()

  #######################
  # --- Error cases --- #
  #######################

  @When "I don't fill out the Name page", ->
    submitPage()

  @When "I fill out the Name page with an invalid DOB", ->
    Pages.Name.fill({
      fullName: 'Jane Doe'
      month: '12'
      day: '33'
      year: '2019'
    })

  @When "I fill out the Contact page with an address that isn't found", ->
    Pages.Contact.fill({email: janedoeEmail, address1: '38383 Philz Way'})

  @When 'I fill out the household member form with missing data', ->
    # don't fill anything out and just submit
    submitPage()


  ########################
  # --- Expectations --- #
  ########################
  # helper functions
  expectByCss = (context, selector, text) ->
    el = element(By.cssContainingText(selector, text))
    # make it case-insensitive to account for text transforms
    el.getText().then (elText) ->
      context.expect(elText.toLowerCase()).to.contain(text.toLowerCase())

  expectByIdAndText = (context, id, text) ->
    el = element(By.id(id))
    # make it case-insensitive to account for text transforms
    el.getText().then (elText) ->
      context.expect(elText.toLowerCase()).to.equal(text.toLowerCase())

  expectInputValue = (context, id, value) ->
    el = element(By.id(id))
    context.expect(el.getAttribute('value')).to.eventually.equal(value)

  expectRadioValue = (context, name, value) ->
    el = element(By.css("input[name='#{name}']:checked"))
    context.expect(el.getAttribute('value')).to.eventually.equal(value)

  expectCheckboxChecked = (context, id) ->
    checkbox = element(By.id(id))
    context.expect(checkbox.isSelected()).to.eventually.equal(true)

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

  @Then /^I should see the successful file upload info for "([^"]*)"/, (preference) ->
    attachmentUploaded = element.all(By.id("uploaded-#{preference}_proofFile")).filter((elem) ->
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

  @Then 'I should still be on the Test Listing application page', ->
    browser.wait(EC.urlContains('apply'), 6000)

  @Then 'I should see the Favorites page', ->
    browser.wait(EC.urlContains('favorites'), 6000)

  ###################################
  # --- Review Page expectations --- #
  ###################################

  @Then 'on the Review Page I should see my contact details', ->
    expectByIdAndText(@, 'full-name', 'Jane Valerie Doe')
    expectByIdAndText(@, 'dob', Pages.Name.defaults.formattedDOB)
    expectByIdAndText(@, 'email', sessionEmail)
    expectByIdAndText(@, 'phone', Pages.Contact.defaults.formattedPhone)
    expectByIdAndText(@, 'alt-phone', Pages.Contact.defaults.formattedAltPhone)
    expectByCss(@, '.info-item_name', '1222 HARRISON ST # 100')
    expectByCss(@, '.info-item_name', Pages.Contact.defaults.mailingAddress1)

  @Then 'on the Review Page I should see my alternate contact details', ->
    expectByIdAndText(@, 'alt-contact-name', Pages.AlternateContact.defaults.fullName)
    expectByIdAndText(@, 'alt-contact-email', Pages.AlternateContact.defaults.email)
    expectByIdAndText(@, 'alt-contact-phone', Pages.AlternateContact.defaults.formattedPhone)
    expectByCss(@, '#review-alt-contact-mailing-address .info-item_name', Pages.AlternateContact.defaults.address)

  @Then 'on the Review Page I should see my household member details', ->
    expectByIdAndText(@, 'household-member-0-name', 'Coleman Francis')
    expectByIdAndText(@, 'household-member-0-dob', '10/15/1985')

  @Then 'on the Review Page I should see my income details', ->
    expectByIdAndText(@, 'income-vouchers', 'NONE')
    expectByIdAndText(@, 'income-amount', '$72,000.00 per year')

  @Then /^on the Review Page I should see my preference details on my "([^"]*)" application$/, (status) ->
    withFiles = (status == 'draft')
    expectByCss(@, '#review-neighborhoodResidence .info-item_name', 'Neighborhood Resident Housing Preference')
    expectByCss(@, '#review-neighborhoodResidence .info-item_note', 'for Jane Doe')
    expectByCss(@, '#review-neighborhoodResidence .info-item_note', 'Gas bill attached') if withFiles
    expectByCss(@, '#review-liveInSf .info-item_name', 'Live in San Francisco Preference')
    expectByCss(@, '#review-liveInSf .info-item_note', 'for Jane Doe')
    expectByCss(@, '#review-liveInSf .info-item_note', 'Gas bill attached') if withFiles
    expectByCss(@, '#review-certOfPreference .info-item_name', 'Certificate of Preference (COP)')
    expectByCss(@, '#review-certOfPreference .info-item_note', 'for Jane Doe')
    expectByCss(@, '#review-displaced .info-item_name', 'Displaced Tenant Housing Preference (DTHP)')
    expectByCss(@, '#review-displaced .info-item_note', 'for Coleman Francis')
    expectByCss(@, '#review-rentBurden .info-item_name', 'Rent Burdened Preference')
    if withFiles
      expectByCss(@, '#review-rentBurden .info-item_note', 'for 1222 HARRISON ST # 100')
      expectByCss(@, '#review-rentBurden .info-item_note', 'Copy of Lease and Money order attached')
    else
      expectByCss(@, '#review-rentBurden .info-item_note', 'for your household')


  #################################################
  # --- Confirming draft details expectations --- #
  #################################################

  @Then /^on the Name page I should see my correct info for "([^"]*)"$/, (fullName) ->
    Pages.Name.expectToMatch(@, { fullName })

  @Then 'on the Contact page I should see my correct info', ->
    Pages.Contact.expectToMatch(@, {email: sessionEmail, address1: '1222 HARRISON ST # 100'})

  @Then 'on the Alternate Contact pages I should see my correct info', ->
    Pages.AlternateContact.expectToMatch(@)

  @Then 'on the Household page I should see my correct info', ->
    expectByCss(@, '#household-primary .info-item_name', 'Jane Doe')
    expectByCss(@, '#household-primary .info-item_value', 'Primary Applicant')
    expectByCss(@, '#household-member-0 .info-item_name', 'Coleman Francis')
    expectByCss(@, '#household-member-0 .info-item_value', 'Household Member')

  @Then 'on the Live in the Neighborhood page I should see my correct info', ->
    expectCheckboxChecked(@, 'preferences-neighborhoodResidence')
    # Jane Doe == '1'
    expectInputValue(@, 'neighborhoodResidence_household_member', '1')
    expectByCss(@, '#uploaded-neighborhoodResidence_proofFile .media-body strong', 'Gas bill')
    expectByCss(@, '#uploaded-neighborhoodResidence_proofFile .media-body .t-micro', 'logo-city')
    expectByCss(@, '#uploaded-neighborhoodResidence_proofFile .media-body .t-small', 'Uploaded')
    submitPage()

  @Then 'on the Rent Burdened page I should see my correct info', ->
    expectCheckboxChecked(@, 'preferences-rentBurden')
    expectByCss(@, '#uploaded-rentBurden_leaseFile .media-body strong', 'Copy of Lease')
    expectByCss(@, '#uploaded-rentBurden_leaseFile .media-body .t-micro', 'logo-portal')
    expectByCss(@, '#uploaded-rentBurden_leaseFile .media-body .t-small', 'Uploaded')
    expectByCss(@, '#uploaded-rentBurden_rentFile .media-body strong', 'Money order')
    expectByCss(@, '#uploaded-rentBurden_rentFile .media-body .t-micro', 'logo-city')
    expectByCss(@, '#uploaded-rentBurden_rentFile .media-body .t-small', 'Uploaded')
    submitPage()

  @Then 'on the Preferences Programs page I should see my correct info', ->
    expectCheckboxChecked(@, 'preferences-certOfPreference')
    expectInputValue(@, 'certOfPreference_household_member', '1')
    expectCheckboxChecked(@, 'preferences-displaced')
    expectInputValue(@, 'displaced_household_member', '2')
    submitPage()

  @Then 'on the Public Housing page I should see my correct info', ->
    expectRadioValue(@, 'hasPublicHousing', 'No')
    submitPage()

  @Then 'on the Monthly Rent page I should see my correct info', ->
    expectInputValue(@, 'monthlyRent_0', '4,000.00')
    submitPage()

  @Then 'on the ADA Priorities page I should see my correct info', ->
    expectCheckboxChecked(@, 'adaPrioritiesSelected_mobility-impaired')
    expectCheckboxChecked(@, 'adaPrioritiesSelected_vision-impaired')
    submitPage()

  @Then 'on the Income pages I should see my correct info', ->
    expectRadioValue(@, 'householdVouchersSubsidies', 'No')
    submitPage()
    expectInputValue(@, 'incomeTotal', '72,000.00')
    submitPage()

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
    expectAlertBox(@, 'Please complete uploading documents or select that you don\'t want this preference.')
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
