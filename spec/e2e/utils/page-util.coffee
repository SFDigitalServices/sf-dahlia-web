remote = require('selenium-webdriver/remote')

PageUtil = {
  testListingId: 'a0W0P00000F8YG4UAN'
  seniorListingId: 'a0W0P00000GwGl3'
  checkCheckbox: (checkboxId, callback) ->
    checkbox = element(By.id(checkboxId))
    checkbox.isSelected().then (selected) ->
      checkbox.click() unless selected
      callback() if callback
  confirmModal: ->
    element(By.css(".reveal-modal button.primary")).click()
  getSelectedLiveMember: () ->
    liveInSfMember = element.all(By.id('liveInSf_household_member')).filter((elem) ->
      elem.isDisplayed()
    ).first()
  goTo: (url) ->
    browser.get(url)
  optOutAndSubmit: ->
    # opt out + submit preference page (e.g. NRHP, Live/Work)
    PageUtil.checkCheckbox('preference-optout', PageUtil.submit)
  scrollToElement: (element) ->
    browser.actions().mouseMove(element).perform()
  submit: ->
    btn = element(By.id('submit'))
    PageUtil.scrollToElement(btn).then -> btn.click()
  uploadPreferenceProof: (preference, documentType, filePath) ->
    element.all(By.id("#{preference}_proofDocument")).filter((elem) ->
      elem.isDisplayed()
    ).first().click()
    element.all(By.cssContainingText('option', documentType)).filter((elem) ->
      elem.isDisplayed()
    ).first().click()

    # need this for uploading file to sauce labs
    browser.setFileDetector new remote.FileDetector()

    filePath = "#{process.env.PWD}#{filePath}"
    element.all(By.css('input[type="file"]')).then( (items) ->
      items[0].sendKeys(filePath)
    )
    browser.sleep(5000)
}

module.exports = PageUtil
