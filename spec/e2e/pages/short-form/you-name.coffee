AngularPage = require('../angular-page').AngularPage

class Name extends AngularPage
  constructor: ->
    @firstName = element(By.model('applicant.firstName'))
    @middleName = element(By.model('applicant.middleName'))
    @lastName = element(By.model('applicant.lastName'))
    @dobMonth = element(By.model('applicant.dob_month'))
    @dobDay = element(By.model('applicant.dob_day'))
    @dobYear = element(By.model('applicant.dob_year'))
    @email = element(By.model('applicant.email'))

    @defaults =
      firstName: 'Jane'
      middleName: 'Valerie'
      lastName: 'Doe'
      dob_month: '2'
      dob_day: '22'
      dob_year: '1990'
      formattedDOB: '2/22/1990'

  fill: (opts = {}) ->
    if opts.fullName
      { firstName, middleName, lastName } = @extractNameParts(opts.fullName)
    else
      firstName = opts.firstName || @defaults.firstName
      middleName = opts.middleName
      lastName = opts.lastName || @defaults.lastName

    if opts.birthDate
      { month, day, year } = @extractDateParts(opts.birthDate)
    else
      month = opts.month || @defaults.dob_month
      day = opts.day || @defaults.dob_day
      year = opts.year || @defaults.dob_year

    @firstName.clear().sendKeys(firstName)
    @middleName.clear().sendKeys(middleName) if middleName
    @lastName.clear().sendKeys(lastName)
    @dobMonth.clear().sendKeys(month)
    @dobDay.clear().sendKeys(day)
    @dobYear.clear().sendKeys(year)
    @email.clear().sendKeys(opts.email) if opts.email
    @submitPage()

  expectToMatch: (context, opts = {}, submit = true) ->
    if opts.fullName
      { firstName, middleName, lastName } = @extractNameParts(opts.fullName)
    else
      firstName = opts.firstName || @defaults.firstName
      middleName = opts.middleName
      lastName = opts.lastName || @defaults.lastName

    if opts.birthDate
      { month, day, year } = @extractDateParts(opts.birthDate)
    else
      month = opts.month || @defaults.dob_month
      day = opts.day || @defaults.dob_day
      year = opts.year || @defaults.dob_year

    context.expect(@firstName.getAttribute('value')).to.eventually.equal(firstName)
    context.expect(@middleName.getAttribute('value')).to.eventually.equal(middleName) if middleName
    context.expect(@lastName.getAttribute('value')).to.eventually.equal(lastName)
    context.expect(@dobMonth.getAttribute('value')).to.eventually.equal(month)
    context.expect(@dobDay.getAttribute('value')).to.eventually.equal(day)
    context.expect(@dobYear.getAttribute('value')).to.eventually.equal(year)
    context.expect(@email.getAttribute('value')).to.eventually.equal(opts.email)
    @submitPage() if submit



module.exports.Name = Name
