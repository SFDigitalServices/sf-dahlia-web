describe 'Short Form', ->
  fillOutYouPageOne = undefined
  fillOutYouPageTwo = undefined

  it 'should submit an application successfully', ->
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
      element(By.id('workInSf_no')).click()
      element(By.id('submit')).click()

    url = 'http://localhost:3000/listings/a0W0P00000DYUcpUAH/apply/name'
    browser.get url
    fillOutYouPageOne()
    fillOutYouPageTwo()

    # no alt contact and lives alone
    element(By.id('alternate_contact_none')).click()
    element(By.id('submit')).click()
    element(By.id('live_alone')).click()

    #skip preferences
    element(By.id('submit')).click()
    element(By.id('submit')).click()

    #indicate income
    element(By.id('householdVouchersSubsidies_yes')).click()
    element(By.id('submit')).click()
    element(By.id('incomeTotal')).sendKeys('22000')
    element(By.id('per_year')).click()
    element(By.id('submit')).click()

    #fill out optional Qs
    element(By.id('referral_newspaper')).click()
    element(By.id('submit')).click()

    #confirm app and submit app
    element(By.id('submit')).click()
    element(By.id('terms_yes')).click()
    element(By.id('submit')).click()

    lotteryNumberMarkup = element(By.id('lottery_number'))
    expect(lotteryNumberMarkup.getText()).toBeTruthy()
    return
  return
