PageUtil = {
  testListingId: 'a0W0P00000F8YG4UAN'
  seniorListingId: 'a0W0x000000GHiFEAW'
  confirmModal: ->
    element(By.css(".reveal-modal button.primary")).click()
  goTo: (url) ->
    browser.get(url)
  scrollToElement: (element) ->
    browser.actions().mouseMove(element).perform()
  submit: ->
    btn = element(By.id('submit'))
    PageUtil.scrollToElement(btn).then -> btn.click()
}

module.exports = PageUtil
