AngularPage = require('../angular-page').AngularPage

class Contact extends AngularPage
  constructor: ->
    @phone = element(By.model('applicant.phone'))
    @phoneType = element(By.model('applicant.phoneType'))
    @addlPhone = element(By.model('applicant.additionalPhone'))
    @altPhone = element(By.model('applicant.alternatePhone'))
    @altPhoneType = element(By.model('applicant.alternatePhoneType'))
    @email = element(By.model('applicant.email'))
    @homeAddress1 = element(By.id('applicant_home_address_address1'))
    @homeAddress2 = element(By.id('applicant_home_address_address2'))
    @homeAddressCity = element(By.id('applicant_home_address_city'))
    @homeAddressState = element(By.id('applicant_home_address_state'))
    @homeAddressZip = element(By.id('applicant_home_address_zip'))

    @altMailingAddress = element(By.model('applicant.hasAltMailingAddress'))
    @mailingAddress1 = element(By.id('applicant_mailing_address_address1'))
    @mailingAddressCity = element(By.id('applicant_mailing_address_city'))
    @mailingAddressState = element(By.id('applicant_mailing_address_state'))
    @mailingAddressZip = element(By.id('applicant_mailing_address_zip'))
    @workInSfYes = element(By.id('workInSf_yes'))
    @workInSfNo = element(By.id('workInSf_yes'))

    @defaults =
      phone: '2222222222'
      phoneType: 'home'
      formattedPhone: '(222) 222-2222'
      altPhone: '5551111111'
      altPhoneType: 'cell'
      formattedAltPhone: '(555) 111-1111'
      homeAddress1: '4053 18th St.'
      homeAddressCity: 'San Francisco'
      homeAddressState: 'California'
      homeAddressStateValue: 'CA'
      homeAddressZip: '94114'
      mailingAddress1: '1651 Tiburon Blvd'
      mailingAddressCity: 'Tiburon'
      mailingAddressState: 'California'
      mailingAddressStateValue: 'CA'
      mailingAddressZip: '94920'

  fill: (opts = {}) ->
    opts.address1 ||= @defaults.homeAddress1
    opts.city ||= @defaults.homeAddressCity
    opts.workInSf ||= @defaults.workInSf

    @phone.clear().sendKeys(@defaults.phone)
    @phoneType.sendKeys(@defaults.phoneType)

    if opts.extra
      @addlPhone.click()
      @altPhone.sendKeys(@defaults.altPhone)
      @altPhoneType.sendKeys(@defaults.altPhoneType)

    @email.clear().sendKeys(opts.email) if opts.email
    @homeAddress1.clear().sendKeys(opts.address1)
    @homeAddress2.clear().sendKeys(opts.address2) if opts.address2
    @homeAddressCity.clear().sendKeys(opts.city)
    @homeAddressState.sendKeys(@defaults.homeAddressState)
    @homeAddressZip.clear().sendKeys(@defaults.homeAddressZip)

    if opts.extra
      @altMailingAddress.click()
      @mailingAddress1.clear().sendKeys(@defaults.mailingAddress1)
      @mailingAddressCity.clear().sendKeys(@defaults.mailingAddressCity)
      @mailingAddressState.sendKeys(@defaults.mailingAddressState)
      @mailingAddressZip.clear().sendKeys(@defaults.mailingAddressZip)

    if opts.workInSf == 'yes'
      @workInSfYes.click()
    else
      @workInSfNo.click()

    @submitPage()

  expectToMatch: (context, opts = {}) ->
    context.expect(@phone.getAttribute('value')).to.eventually.equal(@defaults.formattedPhone)
    context.expect(@email.getAttribute('value')).to.eventually.equal(opts.email)
    context.expect(@altPhone.getAttribute('value')).to.eventually.equal(@defaults.formattedAltPhone)
    context.expect(@homeAddress1.getAttribute('value')).to.eventually.equal(opts.address1)
    context.expect(@homeAddress2.getAttribute('value')).to.eventually.equal('')
    context.expect(@homeAddressCity.getAttribute('value')).to.eventually.equal(@defaults.homeAddressCity.toUpperCase())
    context.expect(@homeAddressState.getAttribute('value')).to.eventually.equal(@defaults.homeAddressStateValue)
    context.expect(@homeAddressZip.getAttribute('value')).to.eventually.equal('94103-4463')
    context.expect(@mailingAddress1.getAttribute('value')).to.eventually.equal(@defaults.mailingAddress1)
    context.expect(@mailingAddressCity.getAttribute('value')).to.eventually.equal(@defaults.mailingAddressCity)
    context.expect(@mailingAddressState.getAttribute('value')).to.eventually.equal(@defaults.mailingAddressStateValue)
    context.expect(@mailingAddressZip.getAttribute('value')).to.eventually.equal(@defaults.mailingAddressZip)
    @submitPage()


module.exports.Contact = Contact
