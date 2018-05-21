Utils = require('../../utils')
Pages = require('../../pages/short-form').Pages

module.exports = ->
  #####################
  # --- Name Page --- #
  #####################

  @When /^I fill out the Name page as "([^"]*)"$/, (fullName) ->
    account = Utils.Account.get(fullName)

    Pages.Name.fill {
      fullName: account.fullName
      birthDate: account.birthDate
      email: account.email
    }

  @When /^I fill out the Name page as "([^"]*)" with birth date "([^"]*)"$/,
    (fullName, birthDate) ->
      account = Utils.Account.get(fullName)

      Pages.Name.fill {
        fullName: account.fullName
        birthDate: birthDate
        email: account.email
      }

  @When 'I submit the Name page with my account info', ->
    element(By.id('submit')).click()

  @Then /^I should see details for "([^"]*)" with birth date "([^"]*)" on the Name page$/,
    (fullName, birthDate) ->
      account = Utils.Account.get(fullName)

      Pages.Name.expectToMatch @, {
        fullName: fullName
        birthDate: birthDate
        email: account.email
      }

  @Then /^I should see the account info for "([^"]*)" filled in on the Name page$/, (fullName) ->
    account = Utils.Account.get(fullName)

    Pages.Name.expectToMatch @, {
      fullName: account.fullName
      birthDate: account.birthDate
      email: account.email
    }

  # Multi-line regex to make coffeelint happy
  @Then new RegExp('^I should see the account info for "([^"]*)" ' +
    'with birth date "([^"]*)" filled in on the Name page$'),
    (fullName, birthDate) ->
      account = Utils.Account.get(fullName)

      Pages.Name.expectToMatch @, {
        fullName: fullName
        birthDate: birthDate
        email: account.email
      }

  @Then 'I should only by able to edit my info from account settings', ->
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

  ######################
  # -- Contact Page -- #
  ######################

  @When 'I fill out the Contact page with a non-SF address, yes to WorkInSF', ->
    Pages.Contact.fill({
      address1: '1120 Mar West G'
      city: 'Tiburon'
      workInSf: 'yes'
    })

  @When 'I fill out the Contact page with a non-SF address, no WorkInSF', ->
    Pages.Contact.fill({
      address1: '1120 Mar West G'
      city: 'Tiburon'
      workInSf: 'no'
    })

  @When 'I fill out the Contact page with an address (non-NRHP match), no WorkInSF', ->
    Pages.Contact.fill({ workInSf: 'no' })

  @When 'I fill out the Contact page with an address (non-NRHP match) and WorkInSF', ->
    Pages.Contact.fill()

  @When 'I fill out the Contact page with an address (NRHP match) and WorkInSF', ->
    Pages.Contact.fill({ address1: '1222 Harrison St.' })

  @When 'I fill out the Contact page with my address (NRHP match) and mailing address', ->
    Pages.Contact.fill({ address1: '1222 Harrison St.', address2: '#100', extra: true })

  @When 'I confirm my address', ->
    element(By.id('confirmed_home_address_yes')).click()
    Utils.Page.submit()

  @Then 'I should see my address (NRHP match) on the Contact page', ->
    Pages.Contact.expectToMatch(@, { address1: '1222 HARRISON ST' })

  @Then 'the Contact page fields should be empty', ->
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
