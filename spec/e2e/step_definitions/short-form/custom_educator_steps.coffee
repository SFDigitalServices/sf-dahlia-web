Utils = require('../../utils')
Pages = require('../../pages/short-form').Pages
{ Then, When } = require('cucumber')

When /^I answer "([^"]*)" to the custom educator screening question$/, (answer) ->
  element(By.id("customEducatorScreeningAnswer_#{answer.toLowerCase()}")).click()

When 'I fill out the Job Code field with a valid Job Classiication Number', ->
  Pages.CustomEducatorScreening.fill(
    Pages.CustomEducatorScreening.defaults.customEducatorJobClassificationNumber
  )

When 'I fill out the Job Code field with an invalid Job Classiication Number', ->
  Pages.CustomEducatorScreening.fill('123INVALIDNUMBER')

Then 'I should see a Job Code field error', ->
  Utils.Expect.alertBox(@, 'You\'ll need to resolve any errors before moving on.')
  Utils.Expect.error(@, 'Job Code is incorrect. Check for mistakes and try again.')

Then 'I should see a form note that says "You are not in a priority group."', ->
  Utils.Expect.byCss(@, '.form-note span', 'You are not in a priority group.')

Then 'on the Review Page I should see my status as not working for SF Unified School District', ->
  Utils.Expect.byIdAndText(@, 'custom-educator-screening-answer', 'No')

Then 'on the Review Page I should see my status as working for SF Unified School District and my Job Classification Number', ->
  Utils.Expect.byIdAndText(@, 'custom-educator-screening-answer', 'Yes')
  Utils.Expect.byIdAndText(
    @,
    'custom-educator-job-classification-number',
    Pages.CustomEducatorScreening.defaults.customEducatorJobClassificationNumber
  )
