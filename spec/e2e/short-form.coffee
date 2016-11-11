Chance = require('../../lib/assets/bower_components/chance')
chance = new Chance()

describe 'Short Form', ->
  EC = undefined
  fillOutYouPageOne = undefined
  fillOutYouPageTwo = undefined
  noAltContactLivesAlone = undefined
  skipPreferences = undefined
  incomeWithVoucher = undefined
  fillOutOptional = undefined
  confirmAndSubmit = undefined
  submitBasicApp = undefined
  createAccount = undefined
  openUrlFromCurrent = undefined
  selectLiveInLiveWork = undefined
  selectLiveSfMember = undefined
  listingId = 'a0W0P00000DYUcpUAH'

  beforeEach ->
    EC = protractor.ExpectedConditions

    fillOutYouPageOne = ->
      element(By.model('applicant.firstName')).sendKeys('Jane')
      element(By.model('applicant.lastName')).sendKeys('Doe')
      element(By.model('applicant.dob_month')).sendKeys('02')
      element(By.model('applicant.dob_day')).sendKeys('22')
      element(By.model('applicant.dob_year')).sendKeys('1990')
      element(By.id('submit')).click()

    fillOutYouPageTwo = ->
      element(By.model('applicant.phone')).sendKeys('2222222222')
      element(By.model('applicant.phoneType')).click()
      element(By.cssContainingText('option', 'Home')).click()
      element(By.model('applicant.email')).sendKeys('jane@doe.com')
      element(By.model('applicant.noAddress')).click()
      element(By.id('workInSf_yes')).click()
      element(By.id('submit')).click()

    noAltContactLivesAlone = ->
      element(By.id('alternate_contact_none')).click()
      element(By.id('submit')).click()
      element(By.id('live_alone')).click()

    skipPreferences = ->
      element(By.id('submit')).click()
      element(By.id('submit')).click()

    incomeWithVoucher = ->
      element(By.id('householdVouchersSubsidies_yes')).click()
      element(By.id('submit')).click()
      element(By.id('incomeTotal')).sendKeys('22000')
      element(By.id('per_year')).click()
      element(By.id('submit')).click()

    fillOutOptional = ->
      element(By.id('referral_newspaper')).click()
      element(By.id('submit')).click()

    confirmAndSubmit = ->
      element(By.id('submit')).click()
      element(By.id('terms_yes')).click()
      element(By.id('submit')).click()

    submitBasicApp = ->
      fillOutYouPageOne()
      fillOutYouPageTwo()
      noAltContactLivesAlone()
      skipPreferences()
      incomeWithVoucher()
      fillOutOptional()
      confirmAndSubmit()

    createAccount = ->
      email = chance.email()
      element(By.id('auth_email')).sendKeys(email)
      element(By.id('auth_email_confirmation')).sendKeys(email)
      element(By.id('auth_password')).sendKeys('password123')
      element(By.id('auth_password_confirmation')).sendKeys('password123')
      element(By.id('submit')).click()

    openUrlFromCurrent = (url) ->
      browser.get(url).catch ->
        browser.switchTo().alert().then (alert) ->
          alert.accept()
          browser.get url

    selectLiveInLiveWork = ->
      element(By.id('preferences-liveWorkInSf')).click()
      element(By.id('liveWorkPrefOption')).click()
      element(By.cssContainingText('option', 'Live in San Francisco')).click()

    selectLiveSfMember = (name) ->
      # there are multiple liveInSf_household_members, click the visible one
      element.all(By.id('liveInSf_household_member')).filter((elem) ->
        elem.isDisplayed()
      ).first().click()
      # there are multiple Jane Doe options, click the visible one
      element.all(By.cssContainingText('option', name)).filter((elem) ->
        elem.isDisplayed()
      ).first().click()

  it 'should submit an application successfully', ->
    url = "/listings/#{listingId}/apply/name"
    browser.get url
    submitBasicApp()
    lotteryNumberMarkup = element(By.id('lottery_number'))
    expect(lotteryNumberMarkup.getText()).toBeTruthy()
    return

  it 'should allow the user to create an account on save draft', ->
    url = "/listings/#{listingId}/apply/name"
    openUrlFromCurrent(url)
    fillOutYouPageOne()
    element(By.id('save_and_finish_later')).click()
    createAccount()
    lotteryNumberMarkup = element(By.id('confirmation_needed'))
    expect(lotteryNumberMarkup.getText()).toBeTruthy()
    return

  describe 'opting in to live/work then saying no on workInSf', ->
    it 'should select live preference', ->
      url = "/listings/#{listingId}/apply/name"
      openUrlFromCurrent(url)
      fillOutYouPageOne()
      fillOutYouPageTwo()
      noAltContactLivesAlone()

      # skip first preference page
      element(By.id('submit')).click()

      selectLiveInLiveWork()
      selectLiveSfMember('Jane Doe')

      # go back to You section and change to workinsf_no
      element(By.cssContainingText('.progress-nav_item', 'You')).click()
      element(By.id('submit')).click()
      element(By.id('workInSf_no')).click()

      element(By.cssContainingText('.progress-nav_item', 'Preferences')).click()
      element(By.id('submit')).click()

      liveInSf = element(By.id('preferences-liveInSf'))
      browser.wait(EC.elementToBeSelected(liveInSf), 5000)
      return
    return

  describe 'selecting live/work member, then going back and forth to prev page', ->
    it 'should still show uploader fields', ->
      url = "/listings/#{listingId}/apply/name"
      openUrlFromCurrent(url)
      fillOutYouPageOne()
      fillOutYouPageTwo()
      noAltContactLivesAlone()

      # skip first preference page
      element(By.id('submit')).click()

      selectLiveInLiveWork()
      selectLiveSfMember('Jane Doe')

      # back to first preference page
      browser.navigate().back()
      element(By.id('submit')).click()

      # there are multiple liveInSf_household_members, click the visible one
      liveInSfMember = element.all(By.id('liveInSf_household_member')).filter((elem) ->
        elem.isDisplayed()
      ).first()
      # expect the member selection field to still be there
      expect(liveInSfMember.getText()).toBeTruthy()
      return
    return
  return
