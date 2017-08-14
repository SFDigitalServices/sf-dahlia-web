AngularPage = require('../angular-page').AngularPage

class Name extends AngularPage
  constructor: ->
    @firstName = element(By.model('applicant.firstName'))
    @middleName = element(By.model('applicant.middleName'))
    @lastName = element(By.model('applicant.lastName'))
    @dobMonth = element(By.model('applicant.dob_month'))
    @dobDay = element(By.model('applicant.dob_day'))
    @dobYear = element(By.model('applicant.dob_year'))

    @defaults =
      dob_month: '2'
      dob_day: '22'
      dob_year: '1990'
      formattedDOB: '2/22/1990'

  fill: (opts = {}) ->
    { firstName, middleName, lastName } = @extractNameParts(opts.fullName)
    month = opts.month || @defaults.dob_month
    day = opts.day || @defaults.dob_day
    year = opts.year || @defaults.dob_year

    @firstName.clear().sendKeys(firstName)
    @middleName.clear().sendKeys(middleName)
    @lastName.clear().sendKeys(lastName)
    @dobMonth.clear().sendKeys(month)
    @dobDay.clear().sendKeys(day)
    @dobYear.clear().sendKeys(year)
    @submitPage()

  expectToMatch: (context, opts = {}) ->
    { firstName, middleName, lastName } = @extractNameParts(opts.fullName)
    month = opts.month || @defaults.dob_month
    day = opts.day || @defaults.dob_day
    year = opts.year || @defaults.dob_year

    context.expect(@firstName.getAttribute('value')).to.eventually.equal(firstName)
    context.expect(@middleName.getAttribute('value')).to.eventually.equal(middleName)
    context.expect(@lastName.getAttribute('value')).to.eventually.equal(lastName)
    context.expect(@dobMonth.getAttribute('value')).to.eventually.equal(month)
    context.expect(@dobDay.getAttribute('value')).to.eventually.equal(day)
    context.expect(@dobYear.getAttribute('value')).to.eventually.equal(year)
    @submitPage()



module.exports.Name = Name
