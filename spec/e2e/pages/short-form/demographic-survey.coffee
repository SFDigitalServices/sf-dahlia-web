AngularPage = require('../angular-page').AngularPage

class DemographicSurvey extends AngularPage
  constructor: ->
    @userGender = element(By.id('user_gender'))
    @genderOther = element(By.id('genderOther'))
    @userSex = element(By.id('user_sexual_orientation'))
    @userSexOther = element(By.id('user_sexual_orientation_other'))
    @userEthnicity = element(By.id('user_ethnicity'))
    @userRace = element(By.id('user_race'))
    @userPrimaryLanguage = element(By.id('user_primary_language'))
    @otherPrimaryLanguage = element(By.id('otherLanguage'))
    @referral = element(By.id('referral'))

    @defaults =
      userGender: 'Not Listed'
      genderOther: 'Dothraki'
      userSex: 'Not listed'
      userSexOther: 'Ziggy Stardust'
      userEthnicity: 'Not Hispanic/Latino'
      userRace: 'Other/Multiracial'
      userPrimaryLanguage: 'Not Listed'
      otherPrimaryLanguage: 'other primary language'
      referral: 'Bus Ad'

  fill: (opts = {}) ->
    @userGender.sendKeys(@defaults.userGender)
    @genderOther.clear().sendKeys(@defaults.genderOther)
    @userSex.sendKeys(@defaults.userSex)
    @userSexOther.clear().sendKeys(@defaults.userSexOther)
    # leave one blank so that we still encounter the survey page
    # @userEthnicity.sendKeys(@defaults.userEthnicity)
    @userRace.sendKeys(@defaults.userRace)
    @userPrimaryLanguage.sendKeys(@defaults.userPrimaryLanguage)
    @otherPrimaryLanguage.clear().sendKeys(@defaults.otherPrimaryLanguage)

    @referral.sendKeys(@defaults.referral)

    @submitPage()

  expectToMatch: (context, opts = {}) ->
    fields = ['userGender', 'genderOther', 'userSex', 'userSexOther', 'userRace', 'userPrimaryLanguage', 'otherPrimaryLanguage', 'referral']
    fields.forEach (field) =>
      context.expect(this[field].getAttribute('value')).to.eventually.equal(@defaults[field])

    @submitPage()


module.exports.DemographicSurvey = DemographicSurvey
