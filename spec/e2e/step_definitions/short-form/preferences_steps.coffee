EC = protractor.ExpectedConditions
Utils = require('../../utils')
{ When, Then } = require('cucumber')

When 'I continue past the Lottery Preferences intro', Utils.Page.submit

When 'I submit my preferences', Utils.Page.submit

When 'I continue past the general lottery notice page', Utils.Page.submit

When /^I select "([^"]*)" for "([^"]*)" preference$/, (fullName, preference) ->
  prefCheckboxId = "preferences-#{preference}"
  Utils.Page.scrollToElement(element(By.id(prefCheckboxId))).then ->
    Utils.Page.checkCheckbox prefCheckboxId, ->
      element.all(By.id("#{preference}_household_member")).filter((elem) ->
        elem.isDisplayed()
      ).first().click()
      element.all(By.cssContainingText("##{preference}_household_member option", fullName))
        .filter((elem) ->
          elem.isDisplayed()
      ).first().click()

When /^I upload a "([^"]*)" as my proof of preference for "([^"]*)"$/,
  (documentType, preference) ->
    Utils.Page.uploadPreferenceProof(
      preference, documentType, '/app/assets/images/logo-city.png')

When /^I upload a too-large "([^"]*)" as my proof of preference for "([^"]*)"$/,
  (documentType, preference) ->
    # currently the max allowed file size after any resizing is 5MB
    # upload a file that will be >5MB even after any resizing
    Utils.Page.uploadPreferenceProof(
      preference, documentType, '/spec/e2e/assets/sf-homes-wide.pdf')

When /^I opt out of "([^"]*)" preference$/, (preference) ->
  Utils.Page.optOutAndSubmit()

Then 'I should see the Preferences Programs screen', ->
  certificateOfPreferenceLabel = element(
    By.cssContainingText('strong.form-label', 'Certificate of Preference (COP)'))
  @expect(certificateOfPreferenceLabel.isPresent()).to.eventually.equal(true)

Then /^I should see the "([^"]*)" checkbox un-checked$/, (preference) ->
  checkbox = element(By.id("preferences-#{preference}"))
  @expect(checkbox.isSelected()).to.eventually.equal(false)

Then /^I should see the "([^"]*)" preference checkbox$/, (prefName) ->
  prefLabel = element.all(By.cssContainingText('strong.form-label', "#{prefName} Preference"))
    .filter((elem) ->
      elem.isDisplayed()
    ).first()
  @expect(prefLabel.isPresent()).to.eventually.equal(true)

Then /^I should see the successful file upload info for "([^"]*)"/, (preference) ->
  attachmentUploaded = element.all(By.id("uploaded-#{preference}_proofFile")).filter((elem) ->
    elem.isDisplayed()
  ).first()
  @expect(attachmentUploaded.isPresent()).to.eventually.equal(true)

Then 'I should still see the preference options and uploader input visible', ->
  # there are multiple liveInSf_household_members, click the visible one
  liveInSfMember = Utils.Page.getSelectedLiveMember()
  # expect the member selection field to still be there
  @expect(liveInSfMember.isPresent()).to.eventually.equal(true)

Then /^I should be on the "([^"]*)" preference page$/, (preference) ->
  preference = element(By.cssContainingText('.form-label', preference))
  @expect(preference.isPresent()).to.eventually.equal(true)

Then /^I should see "([^"]*)" in the preference dropdown and not "([^"]*)"$/,
  (eligible, ineligible) ->
    eligible = eligible.split(', ')
    ineligible = ineligible.split(', ')
    eligible.forEach (fullName) =>
      opt = element(By.cssContainingText('option', fullName))
      @expect(opt.isPresent()).to.eventually.equal(true)
    ineligible.forEach (fullName) =>
      opt = element(By.cssContainingText('option', fullName))
      @expect(opt.isPresent()).to.eventually.equal(false)

Then /^I should see "([^"]*)" preference claimed for "([^"]*)"$/, (preference, name) ->
  claimedPreference = element(By.cssContainingText('.info-item_name', preference))
  @expect(claimedPreference.isPresent()).to.eventually.equal(true)
  claimedMember = element(By.cssContainingText('.info-item_note', name))
  @expect(claimedMember.isPresent()).to.eventually.equal(true)

  preferenceMember = element(By.cssContainingText('.info-item_note', name))
  @expect(preferenceMember.isPresent()).to.eventually.equal(true)

Then 'I should see an error about uploading proof', ->
  Utils.Expect.alertBox(@,
    'Please complete uploading documents or select that you don\'t want this preference.')
  Utils.Expect.error(@, 'Please upload a valid document')

Then 'I should see errors about uploading Rent Burdened proof', ->
  Utils.Expect.alertBox(@,
    'Please complete uploading documents or select that you don\'t want this preference.')
  Utils.Expect.error(@, 'Please complete uploading documents above.')

Then 'I should see an error about the file being too large', ->
  Utils.Expect.error(@, 'The file is too large or not a supported file type', '.error')

########################################
# -- Rent Burdened/Assested Housing -- #
########################################

When 'I select Assisted Housing Preference', ->
  Utils.Page.checkCheckbox('preferences-assistedHousing')

When 'I go back to the RB/AH preference page', ->
  navItem = element(By.cssContainingText('.progress-nav_item', 'Preferences'))
  scrollToElement(navItem).then ->
    navItem.click()
    # skip intro, either RB/AH should be the first preference
    Utils.Page.submit()

When 'I select Rent Burdened Preference', ->
  Utils.Page.checkCheckbox('preferences-rentBurden')

When /^I upload a Copy of Lease as my proof for Assisted Housing$/, ->
  filePath = "#{process.env.PWD}/app/assets/images/logo-portal.png"
  element(By.id('ngf-assistedHousing_proofFile')).sendKeys(filePath)
  browser.sleep(1000)

When /^I upload a Copy of Lease and "([^"]*)" as my proof for Rent Burden$/, (documentType) ->
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

When /^I upload an additional "([^"]*)" as my proof for Rent Burden$/, (documentType) ->
  filePath = "#{process.env.PWD}/app/assets/images/logo-portal.png"
  # click the "upload additional proof" button
  element(By.id('upload-additional-proof')).click()
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

When 'I open the first address in my Rent Burden dashboard', ->
  element.all(By.css('.edit-link.info-item_link')).filter((elem) ->
    elem.isDisplayed()
  ).first().click()

When 'I open the last address in my Rent Burden dashboard', ->
  element.all(By.css('.edit-link.info-item_link')).filter((elem) ->
    elem.isDisplayed()
  ).last().click()

When 'I indicate being done with this address', ->
  Utils.Page.submit()

Then 'I should see green checkmarks indicating my uploads for Lease and Rent', ->
  lease = element.all(By.cssContainingText('.info-item_doc', 'Copy of Lease')).first()
  @expect(lease.isPresent()).to.eventually.equal(true)
  @expect(lease.isElementPresent(By.css('.i-check'))).to.eventually.equal(true)
  rent = element.all(By.cssContainingText('.info-item_doc', 'Proof of Rent')).first()
  @expect(rent.isPresent()).to.eventually.equal(true)
  @expect(rent.isElementPresent(By.css('.i-check'))).to.eventually.equal(true)

Then 'I should see a red X indicating missing uploads for Lease and Rent', ->
  lease = element.all(By.cssContainingText('.info-item_doc', 'Copy of Lease')).last()
  @expect(lease.isPresent()).to.eventually.equal(true)
  @expect(lease.isElementPresent(By.css('.i-close'))).to.eventually.equal(true)
  rent = element.all(By.cssContainingText('.info-item_doc', 'Proof of Rent')).last()
  @expect(rent.isPresent()).to.eventually.equal(true)
  @expect(rent.isElementPresent(By.css('.i-close'))).to.eventually.equal(true)

Then 'I should see proof uploaders for rent burden files', ->
  # expect the rentBurdenedPreference component to render with the proof uploaders inside,
  # rather than the dashboard
  uploader = element(By.model('$ctrl.proofDocument.file.name'))
  @expect(uploader.isPresent()).to.eventually.equal(true)

Then 'on the Rent Burdened page I should see my correct info', ->
  Utils.Expect.checkboxChecked(@, 'preferences-rentBurden')
  Utils.Expect.byCss(@, '#uploaded-rentBurden_leaseFile .media-body strong', 'Copy of Lease')
  Utils.Expect.byCss(@, '#uploaded-rentBurden_leaseFile .media-body .t-micro', 'logo-portal')
  Utils.Expect.byCss(@, '#uploaded-rentBurden_leaseFile .media-body .t-small', 'Uploaded')
  Utils.Expect.byCss(@, '#uploaded-rentBurden_rentFile .media-body strong', 'Money order')
  Utils.Expect.byCss(@, '#uploaded-rentBurden_rentFile .media-body .t-micro', 'logo-city')
  Utils.Expect.byCss(@, '#uploaded-rentBurden_rentFile .media-body .t-small', 'Uploaded')
  Utils.Page.submit()

##############
# -- NRHP -- #
##############

When 'I click the Live in the Neighborhood checkbox', ->
  Utils.Page.checkCheckbox('preferences-neighborhoodResidence')

When 'I click the Next button on the Live in the Neighborhood page', ->
  Utils.Page.submit()

Then 'on the Live in the Neighborhood page I should see my correct info', ->
  Utils.Expect.checkboxChecked(@, 'preferences-neighborhoodResidence')
  # Jane Doe == '1'
  Utils.Expect.inputValue(@, 'neighborhoodResidence_household_member', '1')
  Utils.Expect.byCss(@, '#uploaded-neighborhoodResidence_proofFile .media-body strong', 'Gas bill')
  Utils.Expect.byCss(@, '#uploaded-neighborhoodResidence_proofFile .media-body .t-micro', 'logo-city')
  Utils.Expect.byCss(@, '#uploaded-neighborhoodResidence_proofFile .media-body .t-small', 'Uploaded')
  Utils.Page.submit()

###################
# -- Live/Work -- #
###################

When 'I click the Live or Work in SF checkbox', ->
  Utils.Page.checkCheckbox('preferences-liveWorkInSf')

When 'I open the Live or Work in SF dropdown', ->
  viewApp = element(By.id('liveWorkPrefOption'))
  browser.wait(EC.presenceOf(viewApp), 5000)
  Utils.Page.checkCheckbox('liveWorkPrefOption')

When 'I select the Live in SF preference', ->
  element(By.cssContainingText('option', 'Live in San Francisco')).click()

When 'I select the Work in SF preference', ->
  element(By.cssContainingText('option', 'Work in San Francisco')).click()

When /^I select "([^"]*)" for "([^"]*)" in Live-Work preference$/, (fullName, preference) ->
  # select either Live or Work preference in the combo Live/Work checkbox
  Utils.Page.checkCheckbox 'preferences-liveWorkInSf', ->
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

When 'I go back to the Live-Work preference page', ->
  navItem = element(By.cssContainingText('.progress-nav_item', 'Preferences'))
  Utils.Page.scrollToElement(navItem).then ->
    navItem.click()
    # skip intro
    Utils.Page.submit().then ->
      # skip RB/AH (if exists)
      rentBurden = element(By.id('preferences-rentBurden'))
      assistedHousing = element(By.id('preferences-assistedHousing'))
      if rentBurden || assistedHousing
        Utils.Page.submit()
      # skip NRHP (if exists)
      if element(By.id('preferences-neighborhoodResidence'))
        Utils.Page.submit()

When 'I click the Next button on the Live-Work Preference page', ->
  Utils.Page.submit()

Then 'I should still see the single Live in San Francisco preference selected', ->
  liveInSf = element(By.id('preferences-liveInSf'))
  browser.wait(EC.elementToBeSelected(liveInSf), 5000)

########################
# -- Alice Griffith -- #
########################

When 'I fill out my address for Alice Griffith', ->
  element(By.id('aliceGriffith_aliceGriffith_address_address1'))
    .clear().sendKeys('1234 Market St.')
  element(By.id('aliceGriffith_aliceGriffith_address_city')).clear().sendKeys('San Francisco')
  element(By.id('aliceGriffith_aliceGriffith_address_state')).sendKeys('CA')
  element(By.id('aliceGriffith_aliceGriffith_address_zip')).clear().sendKeys('94114')

When "I fill out an address for Alice Griffith that's a PO Box", ->
  element(By.id('aliceGriffith_aliceGriffith_address_address1'))
    .clear().sendKeys('P.O. Box 37176')
  element(By.id('aliceGriffith_aliceGriffith_address_city')).clear().sendKeys('San Francisco')
  element(By.id('aliceGriffith_aliceGriffith_address_state')).sendKeys('CA')
  element(By.id('aliceGriffith_aliceGriffith_address_zip')).clear().sendKeys('94114')

Then 'on the Alice Griffith page I should see my correct info', ->
  Utils.Expect.checkboxChecked(@, 'preferences-aliceGriffith')
  # Coleman Francis == '2'
  Utils.Expect.inputValue(@, 'aliceGriffith_household_member', '2')
  Utils.Expect.byCss(@,
    '#uploaded-aliceGriffith_proofFile .media-body strong', 'Letter from SFHA verifying address')
  Utils.Expect.byCss(@, '#uploaded-aliceGriffith_proofFile .media-body .t-micro', 'logo-city')
  Utils.Expect.byCss(@, '#uploaded-aliceGriffith_proofFile .media-body .t-small', 'Uploaded')
  @expect(element(By.id('aliceGriffith_aliceGriffith_address_address1')).getAttribute('value'))
    .to.eventually.equal('1234 MARKET ST')
  @expect(element(By.id('aliceGriffith_aliceGriffith_address_city')).getAttribute('value'))
    .to.eventually.equal('SAN FRANCISCO')
  @expect(element(By.id('aliceGriffith_aliceGriffith_address_state')).getAttribute('value'))
    .to.eventually.equal('CA')
  @expect(element(By.id('aliceGriffith_aliceGriffith_address_zip')).getAttribute('value'))
    .to.eventually.equal('94102-4801')
  Utils.Page.submit()

Then 'I should see a blank address error', ->
  Utils.Expect.error(@, 'Please enter an address')

##################
# -- COP-DTHP -- #
##################

When 'I don\'t choose COP-DTHP preferences', ->
  # skip preferences programs
  Utils.Page.submit()

When /^I fill out my "([^"]*)" certificate number$/, (preference) ->
  element(By.id("#{preference}-certificate")).sendKeys('11223344')

Then 'on the Preferences Programs page I should see my correct info', ->
  Utils.Expect.checkboxChecked(@, 'preferences-certOfPreference')
  Utils.Expect.inputValue(@, 'certOfPreference_household_member', '1')
  Utils.Expect.inputValue(@, 'certOfPreference-certificate', '11223344')
  Utils.Expect.checkboxChecked(@, 'preferences-displaced')
  Utils.Expect.inputValue(@, 'displaced_household_member', '2')
  Utils.Expect.inputValue(@, 'displaced-certificate', '11223344')
  Utils.Page.submit()

##################
# -- Veterans -- #
##################

When /^I answer "Yes" to the Veterans preference question and select "([^"]*)"$/, (fullName) ->
  element(By.id("isAnyoneAVeteran_yes")).click()
  element(By.id("selected_veteran_member")).click()
  element.all(By.cssContainingText("#selected_veteran_member option", fullName))
    .filter((elem) ->
      elem.isDisplayed()
  ).first().click()
  Utils.Page.submit()

When 'I answer "No" to the Veterans preference question', ->
  element(By.id("isAnyoneAVeteran_no")).click()
  Utils.Page.submit()

When 'I answer "Prefer not to answer" to the Veterans preference question', ->
  element(By.id("isAnyoneAVeteran_decline-to-state")).click()
  Utils.Page.submit()

Then 'on the Veterans preference page I should see my correct info', ->
  Utils.Expect.radioValue(@, 'isAnyoneAVeteran', 'Yes')
  Utils.Expect.inputValue(@, 'selected_veteran_member', '1')
  Utils.Page.submit()

# This is a workaround for the Veterans feature flag to work with e2e tests
# TODO remove this when the Veterans feature flag is removed
When 'I conditionally continue past the general lottery notice page', ->
  Utils.Page.submit()
