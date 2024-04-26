Utils = require('../../utils')
Pages = require('../../pages/short-form').Pages
{ When, Then } = require('cucumber')

When 'I go back to the Household page', ->
  navItem = element(By.cssContainingText('.progress-nav_item', 'Household'))
  Utils.Page.scrollToElement(navItem).then ->
    navItem.click()

When 'I indicate I will live alone', ->
  element(By.id('live-alone')).click()

When 'I indicate living with other people', ->
  element(By.id('other-people')).click()
  # also skip past household-overview
  Utils.Page.submit()

When 'I open the household member form', ->
  element(By.id('add-household-member')).click()

When 'I cancel the household member', ->
  browser.sleep(1000) # sometimes it says the button is not clickable, this helps?
  element(By.id('cancel-member')).click()

When 'I edit the last household member', ->
  element.all(By.cssContainingText('.edit-link', 'Edit')).filter((elem) ->
    elem.isDisplayed()
  ).last().click()

When /^I add another household member named "([^"]*)" with same address as primary$/,
  (fullName) ->
    browser.waitForAngular()
    element(By.id('add-household-member')).click().then ->
      Pages.HouseholdMemberForm.fill({ fullName })

When /^I add another household member named "([^"]*)" with same address as primary and with birth date "([^"]*)"$/,
  (fullName, birthDate) ->
    browser.waitForAngular()
    element(By.id('add-household-member')).click().then ->
      Pages.HouseholdMemberForm.fill(
        { fullName: fullName, birthDate:birthDate }
      )

When /^I add another household member named "([^"]*)" who lives at "([^"]*)"$/,
  (fullName, address1) ->
    browser.waitForAngular()
    element(By.id('add-household-member')).click().then ->
      Pages.HouseholdMemberForm.fill({ fullName, address1 })

When 'I change them to live inside SF, work in SF', ->
  Pages.HouseholdMemberForm.fill({ address1: '4053 18th St.', workInSf: 'yes' })

When 'I change them to live outside SF, work in SF', ->
  Pages.HouseholdMemberForm.fill {
    address1: '1120 Mar West G'
    city: 'Tiburon'
    workInSf: 'yes'
  }

When /^I change their address to "([^"]*)"$/, (address1) ->
  Pages.HouseholdMemberForm.fill({ address1 })

When 'I confirm their address', ->
  element(By.id('confirmed_home_address_yes')).click()
  Utils.Page.submit()

When 'I indicate being done adding people', ->
  Utils.Page.submit()

When 'I indicate living in public housing', ->
  element(By.id('hasPublicHousing_yes')).click()
  Utils.Page.submit()

When 'I indicate not living in public housing', ->
  element(By.id('hasPublicHousing_no')).click()
  Utils.Page.submit()

When /^I enter "([^"]*)" for each of my monthly rents$/, (monthlyRent) ->
  element.all(By.css('.form-income_input')).each((elem) ->
    # we just fill out the same rent value for each rent input
    elem.sendKeys(monthlyRent)
  ).then Utils.Page.submit

When 'I indicate no ADA priority', ->
  Utils.Page.checkCheckbox 'adaPrioritiesSelected_none', Utils.Page.submit

When 'I indicate ADA Mobility and Vision impairments', ->
  Utils.Page.checkCheckbox 'adaPrioritiesSelected_mobility-impairments', ->
    Utils.Page.checkCheckbox 'adaPrioritiesSelected_vision-impairments', Utils.Page.submit

When 'I fill out the household member form with missing data', ->
  # don't fill anything out and just submit
  Utils.Page.submit()

Then 'on the Household page I should see my correct info', ->
  Utils.Expect.byCss(@, '#household-primary .info-item_name', 'E2ETEST-Jane Doe')
  Utils.Expect.byCss(@, '#household-primary .info-item_value', 'Primary Applicant')
  Utils.Expect.byCss(@, '#household-member-0 .info-item_name', 'Coleman Francis')
  Utils.Expect.byCss(@, '#household-member-0 .info-item_value', 'Household Member')

Then 'on the Public Housing page I should see my correct info', ->
  Utils.Expect.radioValue(@, 'hasPublicHousing', 'No')
  Utils.Page.submit()

Then 'on the ADA Priorities page I should see my correct info', ->
  Utils.Expect.checkboxChecked(@, 'adaPrioritiesSelected_mobility-impairments')
  Utils.Expect.checkboxChecked(@, 'adaPrioritiesSelected_vision-impairments')
  Utils.Page.submit()

Then 'I should see an error on the household member form', ->
  browser.waitForAngular()
  Utils.Expect.alertBox(@)
  Utils.Expect.error(@, 'Please enter a First Name')

Then 'I should see an error about household size being too big', ->
  browser.waitForAngular()
  Utils.Expect.alertBox(@, 'Unfortunately it appears you do not qualify')
  Utils.Expect.error(@, 'Your household size is too big', '.c-alert')
