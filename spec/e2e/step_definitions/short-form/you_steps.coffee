Utils = require('../../utils')
Pages = require('../../pages/short-form').Pages
{ When, Then } = require('cucumber')

When 'I fill out the Contact page with an address, non-NRHP match, no WorkInSF', ->
  Pages.Contact.fill({ workInSf: 'no' })
#####################
# --- Name Page --- #
#####################

When /^I fill out the Name page as "([^"]*)"$/, (fullName) ->
  account = Utils.Account.getOrCreate(fullName)

  Pages.Name.fill {
    fullName: account.fullName
    birthDate: account.birthDate
    email: account.email
  }

When /^I fill out the Name page as "([^"]*)" with birth date "([^"]*)"$/,
  (fullName, birthDate) ->
    account = Utils.Account.getOrCreate(fullName, birthDate)

    Pages.Name.fill {
      fullName: account.fullName
      birthDate: birthDate
      email: account.email
    }

When /^I fill out the Name page with the email "([^"]*)"$/, (email) ->
  Pages.Name.fill({ email: email })

When 'I submit the Name page with my account info', ->
  element(By.id('submit')).click()

When "I don't fill out the Name page", ->
  Utils.Page.submit()

When "I fill out the Name page with non-latin characters", ->
  element(By.model('applicant.firstName')).sendKeys('Jane中文')
  element(By.id('submit')).click()

When "I fill out the Name page with an invalid DOB", ->
  Pages.Name.fill({
    fullName: 'Jane Doe'
    month: '12'
    day: '33'
    year: '2099'
  })

Then /^I should see details for "([^"]*)" on the Name page$/, (fullName) ->
  account = Utils.Account.get(fullName)

  Pages.Name.expectToMatch @, {
    fullName: account.fullName
    birthDate: account.birthDate
    email: account.email
  }

Then /^I should see details for "([^"]*)" with birth date "([^"]*)" on the Name page$/,
  (fullName, birthDate) ->
    account = Utils.Account.get(fullName)

    Pages.Name.expectToMatch @, {
      fullName: fullName
      birthDate: birthDate
      email: account.email
    }

Then /^I should see the account info for "([^"]*)" filled in on the Name page$/, (fullName) ->
  account = Utils.Account.get(fullName)

  Pages.Name.expectToMatch @, {
    fullName: account.fullName
    birthDate: account.birthDate
    email: account.email
  }

Then new RegExp('^I should see the account info for "([^"]*)" ' +
  'with birth date "([^"]*)" filled in on the Name page$'),
  (fullName, birthDate) ->
    account = Utils.Account.get(fullName)

    Pages.Name.expectToMatch @, {
      fullName: fullName
      birthDate: birthDate
      email: account.email
    }

Then /^I should see the truncated name "([^"]*)" on the Name page$/, (name) ->
  Pages.Name.expectNameToMatch @, name

Then 'I should only by able to edit my info from account settings', ->
  [
    'applicant_first_name',
    'applicant_last_name',
    'date_of_birth_month',
    'date_of_birth_day',
    'date_of_birth_year',
    'applicant_email',
  ].forEach (field) ->
    Utils.Expect.inputDisabled(@, field)
  , @

  accountSettingsLink = element(By.css('a[href="/account-settings"]'))
  @expect(accountSettingsLink.isPresent()).to.eventually.equal(true)

Then 'I should see name field errors on the Name page', ->
  Utils.Expect.alertBox(@)
  Utils.Expect.error(@, 'Please enter a First Name')

Then 'I should see an error about providing answers in English on the Name page', ->
  Utils.Expect.alertBox(@)
  Utils.Expect.error(@, 'Please provide your answers in English')

Then 'I should see DOB field errors on the Name page', ->
  Utils.Expect.alertBox(@)
  Utils.Expect.error(@, 'Please enter a valid Date of Birth')

Then 'I should see an email error on the Name page', ->
  Utils.Expect.alertBox(@)
  Utils.Expect.error(@, 'Please enter an email address')

######################
# -- Contact Page -- #
######################

When 'I go back to the Contact page', ->
  navItem = element(By.cssContainingText('.progress-nav_item', 'You'))
  Utils.Page.scrollToElement(navItem).then ->
    navItem.click()
    Utils.Page.submit()

When 'I fill out the Contact page with a non-SF address, yes to WorkInSF', ->
  Pages.Contact.fill({
    address1: '1120 Mar West G'
    city: 'Tiburon'
    workInSf: 'yes'
  })

When 'I fill out the Contact page with a non-SF address, no WorkInSF', ->
  Pages.Contact.fill({
    address1: '1120 Mar West G'
    city: 'Tiburon'
    workInSf: 'no'
  })


When 'I fill out the Contact page with an address, non-NRHP match, and WorkInSF', ->
  Pages.Contact.fill()

When 'I fill out the Contact page in Español', ->
  Pages.Contact.fill({phoneType: 'Casa'})

When 'I fill out the Contact page with an address, NRHP match, and WorkInSF', ->
  Pages.Contact.fill({ address1: '1222 Harrison St.' })

When 'I fill out the Contact page with my address, NRHP match, and mailing address', ->
  Pages.Contact.fill({ address1: '1222 Harrison St.', address2: '#100', extra: true })

When 'I confirm my address', ->
  element(By.id('confirmed_home_address_yes')).click()
  Utils.Page.submit()

When /^I change WorkInSF to "([^"]*)"$/, (workInSf) ->
  if workInSf == 'Yes'
    element(By.id('workInSf_yes')).click()
  else
    element(By.id('workInSf_no')).click()

When "I fill out the Contact page with an address that's a PO Box", ->
  Pages.Contact.fill({ address1: 'P.O. Box 8097', city: 'San Francisco', zip: '94128'})

When 'I fill out the Contact page with a fake address', ->
  Pages.Contact.fill({ address1: '1234 Test St', zip: '94920' })

Then 'I should see my address, NRHP match, on the Contact page', ->
  Pages.Contact.expectToMatch(@, { address1: '1222 HARRISON ST', zip: '94103' })

Then 'the Contact page fields should be empty', ->
  [
    'applicant_phone',
    'applicant_phone_type',
    'applicant_home_address_address1',
    'applicant_home_address_address2',
    'applicant_home_address_city',
    'applicant_home_address_state',
    'applicant_home_address_zip',
  ].forEach (field) ->
    Utils.Expect.emptyField(@, field)
  , @

Then 'on the Contact page I should see my correct info', ->
  Pages.Contact.expectToMatch(@, { address1: '1222 HARRISON ST # 100', extra: true })

###########################
# -- Alternate Contact -- #
###########################

When 'I don\'t indicate an alternate contact', ->
  element(By.id('alternate_contact_none')).click()
  Utils.Page.submit()

When 'I fill out an alternate contact', ->
  Pages.AlternateContact.fillAllSections()

When 'I select an alternate contact of type Other', ->
  Pages.AlternateContact.selectTypeOther()

When /^I fill out the AlternateContact Name page as "([^"]*)"$/, (fullName) ->
  account = Utils.Account.getOrCreate(fullName)
  Pages.AlternateContact.fillName {
    fullName: account.fullName
  }

When /^I fill out the AlternateContact Contact page with the email "([^"]*)"$/, (email) ->
  Pages.AlternateContact.fillContact({ email: email })

Then 'I should see an email error on the AlternateContact page', ->
  Utils.Expect.alertBox(@)
  Utils.Expect.error(@, 'Please enter an email address')

Then 'on the Alternate Contact pages I should see my correct info', ->
  Pages.AlternateContact.expectToMatch(@)
