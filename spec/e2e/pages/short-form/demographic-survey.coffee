AngularPage = require('../angular-page').AngularPage

class DemographicSurvey extends AngularPage
  constructor: ->
    @userGender = element(By.id('user_gender'))
    @genderOther = element(By.id('genderOther'))
    @userSex = element(By.id('user_sexual_orientation'))
    @userSexOther = element(By.id('user_sexual_orientation_other'))
    @userEthnicity = element(By.id('user_ethnicity'))
    @userRace = element(By.id('user_race'))

    @referralNewspaper = element(By.id('referral_newspaper'))
    @referralMOHCD = element(By.id('referral_mohcd-website'))

    @defaults =
      userGender: 'Not Listed'
      genderOther: 'Dothraki'
      userSex: 'Not listed'
      userSexOther: 'Ziggy Stardust'
      userEthnicity: 'Not Hispanic/Latino'
      userRace: 'Other/Multiracial'

  fill: (opts = {}) ->
    @userGender.sendKeys(@defaults.userGender)
    @genderOther.clear().sendKeys(@defaults.genderOther)
    # leave one blank so that we still encounter the survey page
    # TODO: leave out something other than sex at birth?
    @userSex.sendKeys(@defaults.userSex)
    @userSexOther.clear().sendKeys(@defaults.userSexOther)
    @userEthnicity.sendKeys(@defaults.userEthnicity)
    @userRace.sendKeys(@defaults.userRace)
    # choose two referral options
    @referralNewspaper.click()
    @referralMOHCD.click()

    @submitPage()

  expectToMatch: (context, opts = {}) ->
    fields = ['userGender', 'genderOther', 'userSex', 'userSexOther', 'userEthnicity', 'userRace']
    fields.forEach (field) =>
      context.expect(this[field].getAttribute('value')).to.eventually.equal(@defaults[field])
    context.expect(@referralNewspaper.isSelected()).to.eventually.equal(true)
    context.expect(@referralMOHCD.isSelected()).to.eventually.equal(true)

    @submitPage()


module.exports.DemographicSurvey = DemographicSurvey
