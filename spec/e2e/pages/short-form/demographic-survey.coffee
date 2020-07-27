AngularPage = require('../angular-page').AngularPage

setCheckboxSelected = (checkboxElement, newSelectedValue) ->
  checkboxElement.isSelected().then (selected) ->
    if selected != newSelectedValue
      checkboxElement.click()

class DemographicSurvey extends AngularPage
  constructor: ->
    @userGender = element(By.id('user_gender'))
    @genderOther = element(By.id('genderOther'))
    @userSex = element(By.id('user_sexual_orientation'))
    @userSexOther = element(By.id('user_sexual_orientation_other'))
    @userEthnicity = element(By.id('user_ethnicity'))
    @blackAccordionHeader = element(By.id('panel-Black'))
    @blackAfricanCheckbox = element(By.id('panel-Black-African'))
    @whiteAccordionHeader = element(By.id('panel-White'))
    @whiteEuropeanCheckbox = element(By.id('panel-White-European'))
    @whiteOtherCheckbox = element(By.id('panel-White-Other'))
    @whiteOther = element(By.id('panel-White-Other-text'))
    @userPrimaryLanguage = element(By.id('user_primary_language'))
    @otherPrimaryLanguage = element(By.id('otherLanguage'))
    @referral = element(By.id('referral'))

    @defaults =
      userGender: 'Not Listed'
      genderOther: 'Dothraki'
      userSex: 'Not listed'
      userSexOther: 'Ziggy Stardust'
      whiteOther: 'German'
      userPrimaryLanguage: 'Not Listed'
      otherPrimaryLanguage: 'other primary language'
      referral: 'Bus Ad'

  fill: (opts = {}) ->
    @userGender.sendKeys(@defaults.userGender)
    @genderOther.clear().sendKeys(@defaults.genderOther)
    @userSex.sendKeys(@defaults.userSex)
    @userSexOther.clear().sendKeys(@defaults.userSexOther)
    @blackAccordionHeader.click()
    browser.waitForAngular()
    setCheckboxSelected(@blackAfricanCheckbox, true)
    @whiteAccordionHeader.click()
    browser.waitForAngular()
    setCheckboxSelected(@whiteEuropeanCheckbox, true)
    setCheckboxSelected(@whiteOtherCheckbox, true)
    # have to wait for the text element to be enabled after checkbox changed
    browser.waitForAngular()
    @whiteOther.clear().sendKeys(@defaults.whiteOther)
    @userPrimaryLanguage.sendKeys(@defaults.userPrimaryLanguage)
    @otherPrimaryLanguage.clear().sendKeys(@defaults.otherPrimaryLanguage)

    @referral.sendKeys(@defaults.referral)

    @submitPage()

  expectToMatch: (context, opts = {}) ->
    fields = [
      'userGender'
      'genderOther'
      'whiteOther'
      'userPrimaryLanguage'
      'otherPrimaryLanguage'
      'referral'
    ]
    fields.forEach (field) =>
      context.expect(this[field].getAttribute('value')).to.eventually.equal(@defaults[field])

    context.expect(@blackAfricanCheckbox.isSelected()).to.eventually.equal(true)
    context.expect(@whiteEuropeanCheckbox.isSelected()).to.eventually.equal(true)
    context.expect(@whiteOtherCheckbox.isSelected()).to.eventually.equal(true)

    @submitPage()


module.exports.DemographicSurvey = DemographicSurvey
