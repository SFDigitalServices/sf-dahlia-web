Utils = require('../../utils')
{ When, Then } = require('cucumber')

When 'I go to the income page', ->
  Utils.Page.submit()

When 'I indicate having vouchers', ->
  element(By.id('householdVouchersSubsidies_yes')).click().then ->
    Utils.Page.submit()

When 'I do not indicate having vouchers', ->
  element(By.id('householdVouchersSubsidies_no')).click().then ->
    Utils.Page.submit()

When /^I fill out my income as "([^"]*)"/, (income) ->
  incomeTotal = element(By.id('incomeTotal'))
  Utils.Page.scrollToElement(incomeTotal).then ->
    incomeTotal.clear().sendKeys(income)
    element(By.id('incomeTimeframe_per-year')).click().then ->
      Utils.Page.submit()

Then 'on the Monthly Rent page I should see my correct info', ->
  Utils.Expect.inputValue(@, 'monthlyRent_0', '4,000.00')
  Utils.Page.submit()

Then 'on the Income pages I should see my correct info', ->
  Utils.Expect.radioValue(@, 'householdVouchersSubsidies', 'No')
  Utils.Page.submit()
  Utils.Expect.inputValue(@, 'incomeTotal', '72,000.00')
  Utils.Page.submit()

Then 'I should see an error about household income being too low', ->
  browser.waitForAngular()
  Utils.Expect.alertBox(@, 'Unfortunately it appears you do not qualify')
  Utils.Expect.error(@, 'Your household income is too low', '.c-alert')

Then 'I should see an error about household income being too high', ->
  browser.waitForAngular()
  Utils.Expect.alertBox(@, 'Unfortunately it appears you do not qualify')
  Utils.Expect.error(@, 'Your household income is too high', '.c-alert')