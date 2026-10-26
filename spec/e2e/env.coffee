{setDefaultTimeout} = require('cucumber')

setDefaultTimeout(60 * 1000)

# TEMP(debug): print Clerk state after each scenario to see whether CI runs with Clerk on
{After} = require('cucumber')
After (scenarioResult) ->
  browser.executeScript(->
    url: location.href
    CLERK_AUTH_ANGULAR: window.CLERK_AUTH_ANGULAR
    hasClerk: !!window.Clerk
    clerkLoaded: window.Clerk?.loaded
    clerkSession: !!window.Clerk?.session
  ).then (state) ->
    console.log("[clerk-debug] #{scenarioResult.status}: #{JSON.stringify(state)}")
