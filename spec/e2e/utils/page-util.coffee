PageUtil = {
  goTo: (url) ->
    browser.get(url)
  scrollToElement: (element) ->
    browser.actions().mouseMove(element).perform()
  submit: ->
    btn = element(By.id('submit'))
    PageUtil.scrollToElement(btn).then -> btn.click()
}

module.exports = PageUtil
