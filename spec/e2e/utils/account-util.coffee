PageUtil = require('./page-util')
Chance = require('chance')
chance = new Chance()
passwordChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

extractNameParts = (fullName) ->
  parts = fullName.split(' ')
  { firstName: parts[0], lastName: parts[parts.length - 1] }

toApiDob = (birthDate) ->
  [month, day, year] = birthDate.split('/')
  "#{year}-#{('0' + month).slice(-2)}-#{('0' + day).slice(-2)}"

Account = {
  confirm: (email) ->
    # confirm the account
    browser.ignoreSynchronization = true
    url = "/api/v1/account/confirm/?email=#{email}"
    PageUtil.goTo(url)
    browser.ignoreSynchronization = false
  # The account pages are served by React now, so their AngularJS ng-model locators are
  # gone and protractor's Angular sync hangs on them. Register through the API instead --
  # these accounts are test setup, not the thing under test.
  register: (account) ->
    { firstName, lastName } = extractNameParts(account.fullName)
    payload = {
      user: {
        email: account.email
        password: account.password
        password_confirmation: account.password
      }
      contact: {
        firstName: firstName
        lastName: lastName
        email: account.email
        DOB: toApiDob(account.birthDate)
      }
      locale: 'en'
      confirm_success_url: 'https://dahlia-full.herokuapp.com/account'
      config_name: 'default'
    }

    browser.ignoreSynchronization = true
    # Must be on the app origin for the request to be same-origin.
    PageUtil.goTo('/')
    browser.executeAsyncScript((body, done) ->
      fetch('/api/v1/auth', {
        method: 'POST'
        headers: { 'Content-Type': 'application/json' }
        body: JSON.stringify(body)
      })
        .then((res) -> res.text().then((text) -> done({ status: res.status, body: text })))
        .catch((err) -> done({ status: 0, body: String(err) }))
      return
    , payload).then (result) ->
      browser.ignoreSynchronization = false
      if result.status >= 400
        throw new Error("Account registration failed (#{result.status}): #{result.body}")
      result
  createConfirmed: (fullName, birthDate) ->
    account = Account.create(fullName, birthDate)
    Account.register(account)
    Account.confirm(account.email)
    account
  _accounts: {},
  create: (fullName, birthDate = '1/1/1902') ->
    Account._accounts[fullName] = {
      fullName: "E2ETEST-#{fullName}"
      email: chance.email()
      birthDate: birthDate
      password: chance.string({ length: 15, pool: passwordChars }) + 'tS9'
    }
  get: (fullName) ->
    Account._accounts[fullName]
  getOrCreate: (fullName, birthDate) ->
    account = Account.get(fullName)
    return account if account
    Account.create(fullName, birthDate)
}

module.exports = Account
