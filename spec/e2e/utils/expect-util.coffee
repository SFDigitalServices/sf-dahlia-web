EC = protractor.ExpectedConditions

ExpectUtil = {
  alert: (context, message, className) ->
    alert = element(By.cssContainingText(className, message))
    context.expect(alert.isPresent()).to.eventually.equal(true)
  alertBox: (context, message = "You'll need to resolve any errors") ->
    ExpectUtil.alert(context, message, '.alert-box')
  alertNotice: (context, message) ->
    ExpectUtil.alert(context, message, '.alert-notice')
  byCss: (context, selector, text) ->
    el = element.all(By.cssContainingText(selector, text)).first()
    # make it case-insensitive to account for text transforms
    el.getText().then (elText) ->
      context.expect(elText.toLowerCase()).to.contain(text.toLowerCase())
  byIdAndText: (context, id, text) ->
    el = element(By.id(id))
    # make it case-insensitive to account for text transforms
    el.getText().then (elText) ->
      context.expect(elText.toLowerCase()).to.equal(text.toLowerCase())
  checkboxChecked: (context, id) ->
    checkbox = element(By.id(id))
    context.expect(checkbox.isSelected()).to.eventually.equal(true)
  emptyField: (context, id) ->
    el = element(By.id(id))
    context.expect(el.getAttribute('value')).to.eventually.equal('')
  error: (context, errorText, className = '.error') ->
    error = element(By.cssContainingText(className, errorText))
    context.expect(error.isPresent()).to.eventually.equal(true)
  inputDisabled: (context, id) ->
    input = element(By.id(id))
    context.expect(input.getAttribute('disabled')).to.eventually.not.be.null
  inputValue: (context, id, value) ->
    el = element(By.id(id))
    context.expect(el.getAttribute('value')).to.eventually.equal(value)
  radioValue: (context, name, value) ->
    el = element(By.css("input[name='#{name}']:checked"))
    context.expect(el.getAttribute('value')).to.eventually.equal(value)
  urlContains: (urlFrag) ->
    browser.wait(EC.urlContains(urlFrag), 10000)
  urlIs: (url) ->
    browser.wait(EC.urlIs(url), 10000)
}

module.exports = ExpectUtil
