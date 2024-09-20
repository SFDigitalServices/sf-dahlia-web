remote = require('selenium-webdriver/remote')
http = require('http')
defer = protractor.promise.defer()
EC = protractor.ExpectedConditions

PageUtil = {
  testListingId: 'a0W0P00000F8YG4UAN'
  seniorListingId: 'a0W0P00000GwGl3'
  saleListingId: 'a0W0P00000GlKfBUAV'
  customEducatorListing1Id: 'a0W4U00000NlQ30UAF'
  customEducatorListing2Id: 'a0W4U00000NlQ2wUAF'
  # there are no test listings with veteran preferences, so we just leave it as a false value for now
  showVeteransApplicationQuestion: false
  checkCheckbox: (checkboxId, callback) ->
    checkbox = element(By.id(checkboxId))
    browser.wait(EC.presenceOf(checkbox), 5000)
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
    browser.get("#{url}?react=false")
  httpGet: (siteUrl) ->
    http.get(siteUrl, (response) ->
      bodyString = ''
      response.setEncoding('utf8')

      response.on "data", (chunk) ->
        bodyString += chunk

      response.on 'end', ->
        defer.fulfill({
          statusCode: response.statusCode,
          bodyString: bodyString
        })
    ).on 'error', (e) ->
      defer.reject("Got http.get error: " + e.message)

    return defer.promise
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
  uploadFile: (documentType, filePath) ->
    # need this for uploading file to sauce labs
    browser.setFileDetector new remote.FileDetector()
    filePath = "#{process.env.PWD}#{filePath}"
    element.all(By.id("ngf-#{documentType}File")).then( (items) ->
      items[0].sendKeys(filePath)
    )
    browser.sleep(5000)
}

module.exports = PageUtil
