{ When, Then } = require('cucumber')
EC = protractor.ExpectedConditions

When /^I select "([^"]*)" as my language$/, (language) ->
  buttonId = switch language
    when "Filipino" then 'submit-tl'
    when "Spanish" then 'submit-es'
    when "English" then 'submit-en'
  languageButton = element(By.id(buttonId))
  browser.wait(EC.presenceOf(languageButton), 10000)
  languageButton.click()

Then /^I should see "([^"]*)" selected in the translate bar language switcher$/, (language) ->
  activeLang = element(By.cssContainingText('.translate-bar li a.active', language))
  @expect(activeLang.isPresent()).to.eventually.equal(true)

Then 'I should be redirected back to the listings page in English', ->
  # we check that it is at the ":3000/listings" URL rather than ":3000/es/listings"
  browser.wait(EC.urlContains(':3000/listings'), 6000)

