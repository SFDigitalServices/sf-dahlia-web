{Before, setDefaultTimeout} = require('cucumber')
PageUtil = require('./utils/page-util')

setDefaultTimeout(60 * 1000)

lastFeatureUri = null

# Every feature assumes it starts signed out, but a scenario that fails partway can
# leave a session behind and take the following features down with it. Scenarios
# within a feature do share a session on purpose -- autofill signs in and then relies
# on that session -- so this resets between features, not between scenarios.
Before (scenario) ->
  uri = try scenario?.getUri?() catch e then null
  return if uri and uri is lastFeatureUri
  lastFeatureUri = uri

  PageUtil.goTo('/')
  browser.executeScript('''
    try {
      window.localStorage.clear()
      window.sessionStorage.clear()
    } catch (e) {}
    return true
  ''').then(->
    browser.manage().deleteAllCookies()
  ).then(->
    # Reload so the app picks up the cleared session rather than keeping it in memory.
    PageUtil.goTo('/')
  )
