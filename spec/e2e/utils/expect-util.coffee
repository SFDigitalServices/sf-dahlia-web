EC = protractor.ExpectedConditions

ExpectUtil = {
  byCss: (context, selector, text) ->
    el = element.all(By.cssContainingText(selector, text)).first()
    # make it case-insensitive to account for text transforms
    el.getText().then (elText) ->
      context.expect(elText.toLowerCase()).to.contain(text.toLowerCase())
  alert: (context, message, className) ->
    alert = element(By.cssContainingText(className, message))
    context.expect(alert.isPresent()).to.eventually.equal(true)
  alertBox: (context, message = "You'll need to resolve any errors") ->
    ExpectUtil.alert(context, message, '.alert-box')
  alertNotice: (context, message) ->
    ExpectUtil.alert(context, message, '.alert-notice')
  emptyField: (context, id) ->
    el = element(By.id(id))
    context.expect(el.getAttribute('value')).to.eventually.equal('')
  # expectError: (context, errorText, className = '.error') ->
  #   error = element(By.cssContainingText(className, errorText))
  #   context.expect(error.isPresent()).to.eventually.equal(true)
  inputDisabled: (context, id) ->
    input = element(By.id(id))
    context.expect(input.getAttribute('disabled')).to.eventually.not.be.null
  urlContains: (urlFrag) ->
    browser.wait(EC.urlContains(urlFrag), 5000)
  urlIs: (url) ->
    browser.wait(EC.urlIs(url), 5000)
}

module.exports = ExpectUtil
