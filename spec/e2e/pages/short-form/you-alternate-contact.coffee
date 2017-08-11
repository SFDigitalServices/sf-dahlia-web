AngularPage = require('../angular-page').AngularPage

class AlternateContact extends AngularPage
  constructor: ->
    @typeOther = element(By.id('alternateContactType_other'))
    @typeOtherInput = element(By.model('alternateContact.alternateContactTypeOther'))

    @firstName = element(By.model('alternateContact.firstName'))
    @lastName = element(By.model('alternateContact.lastName'))

    @phone = element(By.model('alternateContact.phone'))
    @email = element(By.model('alternateContact.email'))
    @mailingAddress1 = element(By.id('alternateContact_mailing_address_address1'))
    @mailingAddressCity = element(By.id('alternateContact_mailing_address_city'))
    @mailingAddressState = element(By.id('alternateContact_mailing_address_state'))
    @mailingAddressZip = element(By.id('alternateContact_mailing_address_zip'))

    @defaults =
      typeOther: 'Psychiatrist'
      firstName: 'Sigmund'
      lastName: 'Freud'
      email: 'siggy@psych.com'
      phone: '1231231234'
      formattedPhone: '(123) 123-1234'
      address: '100 Van Ness Ave'
      city: 'San Francisco'
      state: 'California'
      zip: '94110'

    @defaults.fullName = "#{@defaults.firstName} #{@defaults.lastName}"
    @defaults.formattedPhone

  fillAllSections: ->
    @typeOther.click()
    @typeOtherInput.sendKeys(@defaults.typeOther)
    @submitPage()

    @firstName.clear().sendKeys(@defaults.firstName)
    @lastName.clear().sendKeys(@defaults.lastName)
    @submitPage()

    @phone.sendKeys(@defaults.phone)
    @email.clear().sendKeys(@defaults.email)
    @mailingAddress1.clear().sendKeys(@defaults.address)
    @mailingAddressCity.clear().sendKeys(@defaults.city)
    @mailingAddressState.sendKeys(@defaults.state)
    @mailingAddressZip.clear().sendKeys(@defaults.zip)
    @submitPage()

  expectToMatch: (context, opts = {}) ->
    context.expect(@typeOther.getAttribute('value')).to.eventually.equal('Other')
    context.expect(@typeOtherInput.getAttribute('value')).to.eventually.equal(@defaults.typeOther)
    @submitPage()

    context.expect(@firstName.getAttribute('value')).to.eventually.equal(@defaults.firstName)
    context.expect(@lastName.getAttribute('value')).to.eventually.equal(@defaults.lastName)
    @submitPage()

    context.expect(@phone.getAttribute('value')).to.eventually.equal(@defaults.formattedPhone)
    context.expect(@email.getAttribute('value')).to.eventually.equal(@defaults.email)
    context.expect(@mailingAddress1.getAttribute('value')).to.eventually.equal(@defaults.address)
    context.expect(@mailingAddressCity.getAttribute('value')).to.eventually.equal(@defaults.city)
    context.expect(@mailingAddressZip.getAttribute('value')).to.eventually.equal(@defaults.zip)
    @submitPage()


module.exports.AlternateContact = AlternateContact
