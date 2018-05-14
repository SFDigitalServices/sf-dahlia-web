module.exports = ->
  @Then /^I should see the "([^"]*)" checkbox un-checked$/, (preference) ->
    checkbox = element(By.id("preferences-#{preference}"))
    @expect(checkbox.isSelected()).to.eventually.equal(false)
