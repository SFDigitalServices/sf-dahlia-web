Utils = require('../../utils')
Pages = require('../../pages/short-form').Pages
EC = protractor.ExpectedConditions
{ When, Then } = require('cucumber')

When 'I fill out the optional survey', ->
  Pages.DemographicSurvey.fill()

When 'I confirm details on the review page', ->
  Utils.Page.submit()

When 'I agree to the terms and submit', ->
  element(By.id('terms_yes')).click().then ->
    Utils.Page.submit()

Then 'I want to make sure that files were uploaded', ->
  that = @
  browser.getCurrentUrl().then (currentUrl) ->
    currentUrl.replace
    applicationId = currentUrl.split('/').pop()
    url = 'http://localhost:3000/api/v1/short-form/application/' + applicationId + '/files'
    Utils.Page.httpGet(url).then((result) ->
      json_data = JSON.parse(result.bodyString)
      that.expect(json_data.status).to.equal('uploaded')
    )

When 'I click to view submitted application', ->
  viewApp = element(By.id('view-app'))
  browser.wait(EC.presenceOf(viewApp), 5000)
  Utils.Page.scrollToElement(viewApp).then ->
    viewApp.click()

Then 'on the optional survey page I should see my correct info', ->
  Pages.DemographicSurvey.expectToMatch(@)

Then 'I should land on the optional survey page', ->
  surveyTitle =
    element(By.cssContainingText('h2.app-card_question',
      'Help us ensure we are meeting our goal'))
  @expect(surveyTitle.isPresent()).to.eventually.equal(true)

Then 'I should see my lottery number on the confirmation page', ->
  lotteryNumberMarkup = element(By.id('lottery_number'))
  @expect(lotteryNumberMarkup.isPresent()).to.eventually.equal(true)

Then 'I should see the general lottery notice on the review page', ->
  claimedPreference =
    element(By.cssContainingText('.info-item_name', 'You will be in the general lottery'))
  @expect(claimedPreference.isPresent()).to.eventually.equal(true)

Then /^on the Review Page I should see my contact details for "([^"]*)"$/, (fullName) ->
  account = Utils.Account.get(fullName)

  Utils.Expect.byIdAndText(@, 'full-name', account.fullName)
  Utils.Expect.byIdAndText(@, 'dob', account.birthDate)
  Utils.Expect.byIdAndText(@, 'email', account.email)
  Utils.Expect.byIdAndText(@, 'phone', Pages.Contact.defaults.formattedPhone)
  Utils.Expect.byIdAndText(@, 'alt-phone', Pages.Contact.defaults.formattedAltPhone)
  Utils.Expect.byCss(@, '.info-item_name', '1222 HARRISON ST # 100')
  Utils.Expect.byCss(@, '.info-item_name', Pages.Contact.defaults.mailingAddress1)

Then 'on the Review Page I should see my alternate contact details', ->
  Utils.Expect.byIdAndText(@, 'alt-contact-name', Pages.AlternateContact.defaults.fullName)
  Utils.Expect.byIdAndText(@, 'alt-contact-email', Pages.AlternateContact.defaults.email)
  Utils.Expect.byIdAndText(@, 'alt-contact-phone', Pages.AlternateContact.defaults.formattedPhone)
  Utils.Expect.byCss(@, '#review-alt-contact-mailing-address .info-item_name',
    Pages.AlternateContact.defaults.address)

Then 'on the Review Page I should see my household member details', ->
  Utils.Expect.byIdAndText(@, 'household-member-0-name', 'Coleman Francis')
  Utils.Expect.byIdAndText(@, 'household-member-0-dob', '10/15/1985')

Then 'on the Review Page I should see my income details', ->
  Utils.Expect.byIdAndText(@, 'income-vouchers', 'NONE')
  Utils.Expect.byIdAndText(@, 'income-amount', '$72,000.00 per year')

Then /^on the Review Page I should see my preference details on my "([^"]*)" application$/,
  (status) ->
    Utils.Expect.byCss(@,
      '#review-neighborhoodResidence .info-item_name', 'Neighborhood Resident Housing Preference')
    Utils.Expect.byCss(@, '#review-neighborhoodResidence .info-item_note', 'for E2ETEST-Jane Doe')
    Utils.Expect.byCss(@, '#review-neighborhoodResidence .info-item_note', 'Gas bill attached')
    Utils.Expect.byCss(@, '#review-liveInSf .info-item_name', 'Live in San Francisco Preference')
    Utils.Expect.byCss(@, '#review-liveInSf .info-item_note', 'for E2ETEST-Jane Doe')
    Utils.Expect.byCss(@, '#review-liveInSf .info-item_note', 'Gas bill attached')
    Utils.Expect.byCss(@,
      '#review-aliceGriffith .info-item_note', 'Letter from SFHA verifying address')
    Utils.Expect.byCss(@,
      '#review-certOfPreference .info-item_name', 'Certificate of Preference (COP)')
    Utils.Expect.byCss(@, '#review-certOfPreference .info-item_note', 'for E2ETEST-Jane Doe')
    Utils.Expect.byCss(@,
      '#review-certOfPreference .info-item_note.t-bold', 'Certificate Number: 11223344')
    Utils.Expect.byCss(@,
      '#review-displaced .info-item_name', 'Displaced Tenant Housing Preference (DTHP)')
    Utils.Expect.byCss(@, '#review-displaced .info-item_note', 'for Coleman Francis')
    Utils.Expect.byCss(@,
      '#review-displaced .info-item_note.t-bold', 'Certificate Number: 11223344')
    Utils.Expect.byCss(@,
      '#review-rentBurden .info-item_name', 'Rent Burdened Preference')
    if Utils.Page.showVeteransApplicationQuestion
      Utils.Expect.byCss(@, '#review-veterans .info-item_name', 'Yes, someone is a veteran')
      Utils.Expect.byCss(@, '#review-veterans .info-item_note', 'for E2ETEST-Jane Doe')

    if status == 'draft'
      # rentBurden displays more detailed info in draft
      Utils.Expect.byCss(@,
        '#review-rentBurden .info-item_note', 'for 1222 HARRISON ST # 100')
      Utils.Expect.byCss(@,
        '#review-rentBurden .info-item_note', 'Copy of Lease and Money order attached')
    else
      Utils.Expect.byCss(@,
        '#review-rentBurden .info-item_note', 'for your household')

Then 'on the Review Page I should see my Rent Burdened preference details', ->
  Utils.Expect.byCss(@, '#review-rentBurden .info-item_note', 'for 4053 18TH ST')
  Utils.Expect.byCss(@, '#review-rentBurden .info-item_note', 'for 2601 MISSION ST')
  Utils.Expect.byCss(@,
    '#review-rentBurden .info-item_note', 'Copy of Lease and Money order attached')

Then 'on the View Submitted App Page I should see Assisted Housing preference claimed', ->
  Utils.Expect.byCss(@, '#review-assistedHousing .info-item_name', 'Assisted Housing Preference')

Then /^on the View Submitted App Page I should see Veterans preference claimed for "([^"]*)"$/, (fullName) ->
  if !Utils.Page.showVeteransApplicationQuestion then return
  Utils.Expect.byCss(@, '#review-veterans .info-item_name', 'Yes, someone is a veteran')
  Utils.Expect.byCss(@, '#review-veterans .info-item_note', "for #{fullName}")
