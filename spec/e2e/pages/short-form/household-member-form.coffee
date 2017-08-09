AngularPage = require('../angular-page').AngularPage

class HouseholdMemberForm extends AngularPage
  constructor: ->
    @firstName = element(By.model('householdMember.firstName'))
    @lastName = element(By.model('householdMember.lastName'))
    @dobMonth = element(By.model('householdMember.dob_month'))
    @dobDay = element(By.model('householdMember.dob_day'))
    @dobYear = element(By.model('householdMember.dob_year'))
    @hasSameAddressAsApplicant_no = element(By.id('hasSameAddressAsApplicant_no'))
    @householdMember_home_address_address1 = element(By.id('householdMember_home_address_address1'))
    @householdMember_home_address_city = element(By.id('householdMember_home_address_city'))
    @householdMember_home_address_state = element(By.id('householdMember_home_address_state'))
    @householdMember_home_address_zip = element(By.id('householdMember_home_address_zip'))
    @hasSameAddressAsApplicant_yes = element(By.id('hasSameAddressAsApplicant_yes'))
    @workInSf_yes = element(By.id('workInSf_yes'))
    @workInSf_no = element(By.id('workInSf_no'))
    @relationship = element(By.model('householdMember.relationship'))

  fill: (opts = {}) ->
    opts.city ||= 'San Francisco'
    opts.workInSf ||= 'no'
    if opts.fullName
      { firstName, middleName, lastName } = @extractNameParts(opts.fullName)

      @firstName.clear().sendKeys(firstName)
      @lastName.clear().sendKeys(lastName)
      @dobMonth.clear().sendKeys('10')
      @dobDay.clear().sendKeys('15')
      @dobYear.clear().sendKeys('1985')
    if opts.address1
      @hasSameAddressAsApplicant_no.click()
      @householdMember_home_address_address1.clear().sendKeys(opts.address1)
      @householdMember_home_address_city.clear().sendKeys(opts.city)
      @householdMember_home_address_state.sendKeys('california')
      @householdMember_home_address_zip.clear().sendKeys('94114')
    else
      @hasSameAddressAsApplicant_yes.click()
    if opts.workInSf == 'yes'
      @workInSf_yes.click()
    else
      @workInSf_no.click()
    @relationship.sendKeys('Cousin')

    @submitPage()



module.exports.HouseholdMemberForm = HouseholdMemberForm
