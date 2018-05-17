AngularPage = require('../angular-page').AngularPage

class CreateAccountPage extends AngularPage
  constructor: ->
    @firstName = element(By.model('userAuth.contact.firstName'))
    @middleName = element(By.model('userAuth.contact.middleName'))
    @lastName = element(By.model('userAuth.contact.lastName'))
    @dobMonth = element(By.model('userAuth.contact.dob_month'))
    @dobDay = element(By.model('userAuth.contact.dob_day'))
    @dobYear = element(By.model('userAuth.contact.dob_year'))
    @email = element(By.model('userAuth.user.email'))
    @emailConfirmation = element(By.model('userAuth.user.email_confirmation'))
    @password = element(By.model('userAuth.user.password'))
    @passwordConfirmation = element(By.model('userAuth.user.password_confirmation'))

    @defaults = {
      firstName: 'Alice'
      lastName: 'Walker'
      dobMonth: '2'
      dobDay: '9'
      dobYear: '1944'
    }

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

    email = opts.email
    password = opts.password

    @firstName.clear().sendKeys(firstName)
    @middleName.clear().sendKeys(middleName) if middleName
    @lastName.clear().sendKeys(lastName)
    @dobMonth.clear().sendKeys(month)
    @dobDay.clear().sendKeys(day)
    @dobYear.clear().sendKeys(year)
    @email.clear().sendKeys(email)
    @emailConfirmation.clear().sendKeys(email)
    @password.clear().sendKeys(password)
    @passwordConfirmation.clear().sendKeys(password)
    @submitPage()

module.exports = new CreateAccountPage
