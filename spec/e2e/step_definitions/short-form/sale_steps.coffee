Utils = require('../../utils')
{ Then } = require('cucumber')

Then 'I check complete homebuyers education', ->
  Utils.Page.checkCheckbox 'application_has_completed_homebuyer_education', Utils.Page.submit

Then 'I should see an error on the prerequisites form', ->
  browser.waitForAngular()
  Utils.Expect.alertBox(@)
  Utils.Expect.error(@, 'This field is required')

Then 'I fill in prerequisites form', ->
  # We expect lending institutions and agents to be updated frequently,
  # so we just select the first available option.
  element(By.css('#lendingInstitution > option:nth-child(2)')).click()
  element(By.css('#lendingAgent > option:nth-child(2)')).click()
  element(By.css('#homebuyerEducationAgency > option:nth-child(2)')).click()

  Utils.Page.uploadFile('Loan pre-approval', '/app/assets/images/logo-city.png')
  Utils.Page.uploadFile('Homebuyer education certificate', '/app/assets/images/logo-city.png')
  Utils.Page.checkCheckbox 'application_is_first_time_homebuyer', ->
    Utils.Page.checkCheckbox 'application_has_loan_pre_approval', Utils.Page.submit
