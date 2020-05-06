{ When, Then } = require('cucumber')

When /^I select "([^"]*)" as my language$/, (language) ->
  switch language
    when "Filipino"
      element(By.id('submit-tl')).click()
    when "Spanish"
      element(By.id('submit-es')).click()
    when "English"
      element(By.id('submit-en')).click()

Then /^I should see "([^"]*)" selected in the translate bar language switcher$/, (language) ->
  activeLang = element(By.cssContainingText('.translate-bar li a.active', language))
  @expect(activeLang.isPresent()).to.eventually.equal(true)

Then 'I should be redirected back to the listings page in English', ->
  # we check that it is at the ":3000/listings" URL rather than ":3000/es/listings"
  browser.wait(EC.urlContains(':3000/listings'), 6000)

