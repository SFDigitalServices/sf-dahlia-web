PageUtil = require('./page-util')
Chance = require('chance')
chance = new Chance()
passwordChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

Account = {
  confirm: (email) ->
    # confirm the account
    browser.ignoreSynchronization = true
    url = "/api/v1/account/confirm/?email=#{email}"
    PageUtil.goTo(url)
    browser.ignoreSynchronization = false
  _accounts: {},
  create: (fullName, birthDate = '1/1/1902') ->
    Account._accounts[fullName] = {
      fullName: fullName
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
