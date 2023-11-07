AngularPage = require('../angular-page').AngularPage
EC = protractor.ExpectedConditions

setCheckboxSelected = (checkboxElement, newSelectedValue) ->
  checkboxElement.isSelected().then (selected) ->
    if selected != newSelectedValue
      checkboxElement.click()

class DemographicSurvey extends AngularPage
  constructor: ->
    super()
    @userGender = element(By.id('user_gender'))
    @genderOther = element(By.id('genderOther'))
    @userSex = element(By.id('user_sexual_orientation'))
    @userSexOther = element(By.id('user_sexual_orientation_other'))
    @userEthnicity = element(By.id('user_ethnicity'))
    @blackAccordionHeader = element(By.id('panel-Black'))
    @blackAfricanCheckbox = element(By.id('panel-Black-African'))
    @indigenousAccordionHeader = element(By.id('panel-Indigenous'))
    @indigenousNativeAmericanCheckbox = element(By.id('panel-Indigenous-American Indian/Native American'))
    @indigenousNativeAmericanGroup = element(By.id('panel-Indigenous-American Indian/Native American-text'))
    @indigenousCentralSouthAmericaCheckbox = element(By.id('panel-Indigenous-Indigenous from Mexico, the Caribbean, Central America, or South America'))
    @indigenousCentralSouthAmericaGroup = element(By.id('panel-Indigenous-Indigenous from Mexico, the Caribbean, Central America, or South America-text'))
    @whiteAccordionHeader = element(By.id('panel-White'))
    @whiteEuropeanCheckbox = element(By.id('panel-White-European'))
    @whiteOtherCheckbox = element(By.id('panel-White-Other'))
    @whiteOther = element(By.id('panel-White-Other-text'))
    @userPrimaryLanguage = element(By.id('user_primary_language'))
    @otherPrimaryLanguage = element(By.id('otherLanguage'))
    @isVeteran_PreferNotTo = element(By.id('isVeteran_decline-to-state'))
    @isNonPrimaryMemberVeteran_PreferNotTo = element(By.id('isNonPrimaryMemberVeteran_decline-to-state'))
    @referral = element(By.id('referral'))

    @defaults =
      userGender: 'Not Listed'
      genderOther: 'Dothraki'
      userSex: 'Not listed'
      userSexOther: 'Ziggy Stardust'
      whiteOther: 'German'
      indigenousNativeAmericanGroup: 'Indigenous North American Group'
      indigenousCentralSouthAmericaGroup: 'Indigenous South/Central American Group'
      userPrimaryLanguage: 'Not Listed'
      otherPrimaryLanguage: 'other primary language'
      isVeteran: 'Prefer not to answer'
      isNonPrimaryMemberVeteran: 'Prefer not to answer'
      referral: 'Bus Ad'

  fill: (opts = {}) ->
    @userGender.sendKeys(@defaults.userGender)
    @genderOther.clear().sendKeys(@defaults.genderOther)
    @userSex.sendKeys(@defaults.userSex)
    @userSexOther.clear().sendKeys(@defaults.userSexOther)

    # Select Black - African
    @blackAccordionHeader.click()
    browser.waitForAngular()
    setCheckboxSelected(@blackAfricanCheckbox, true)

    # Select two indigenous fields and add specific group text
    @indigenousAccordionHeader.click()
    browser.waitForAngular()
    setCheckboxSelected(@indigenousNativeAmericanCheckbox, true)
    setCheckboxSelected(@indigenousCentralSouthAmericaCheckbox, true)
    # have to wait for the text element to be enabled after checkbox changed
    browser.waitForAngular()
    @indigenousNativeAmericanGroup.clear().sendKeys(@defaults.indigenousNativeAmericanGroup)
    @indigenousCentralSouthAmericaGroup.clear().sendKeys(@defaults.indigenousCentralSouthAmericaGroup)

    # Select White-European and White - Other and add other text
    @whiteAccordionHeader.click()
    browser.waitForAngular()
    setCheckboxSelected(@whiteEuropeanCheckbox, true)
    setCheckboxSelected(@whiteOtherCheckbox, true)
    # have to wait for the text element to be enabled after checkbox changed
    browser.waitForAngular()
    @whiteOther.clear().sendKeys(@defaults.whiteOther)

    @userPrimaryLanguage.sendKeys(@defaults.userPrimaryLanguage)
    @otherPrimaryLanguage.clear().sendKeys(@defaults.otherPrimaryLanguage)

    # Set veteran answers
    @isVeteran_PreferNotTo.click()
    @isNonPrimaryMemberVeteran_PreferNotTo.click()

    @referral.sendKeys(@defaults.referral)

    @submitPage()

  expectToMatch: (context, opts = {}) ->
    fields = [
      'userGender'
      'genderOther'
      'whiteOther'
      'indigenousCentralSouthAmericaGroup'
      'indigenousNativeAmericanGroup'
      'userPrimaryLanguage'
      'otherPrimaryLanguage'
      'referral'
    ]
    fields.forEach (field) =>
      context.expect(this[field].getAttribute('value')).to.eventually.equal(@defaults[field])

    context.expect(@blackAfricanCheckbox.isSelected()).to.eventually.equal(true)
    context.expect(@whiteEuropeanCheckbox.isSelected()).to.eventually.equal(true)
    context.expect(@whiteOtherCheckbox.isSelected()).to.eventually.equal(true)
    context.expect(@indigenousNativeAmericanCheckbox.isSelected()).to.eventually.equal(true)
    context.expect(@indigenousCentralSouthAmericaCheckbox.isSelected()).to.eventually.equal(true)

    @submitPage()


module.exports.DemographicSurvey = DemographicSurvey
