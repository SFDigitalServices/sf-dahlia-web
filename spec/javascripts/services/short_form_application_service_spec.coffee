do ->
  'use strict'
  describe 'ShortFormApplicationService', ->
    ShortFormApplicationService = undefined
    $localStorage = undefined
    fakeAddress =
      address1: '123 Main St.'
      city: 'San Francisco'
      state: 'CA'
      zip: '94109'

    beforeEach module('dahlia.services', ($provide)->
      return
    )

    beforeEach inject((_ShortFormApplicationService_, _$localStorage_) ->
      $localStorage = _$localStorage_
      ShortFormApplicationService = _ShortFormApplicationService_
      # have to clear out local storage beforeEach test
      $localStorage.application = ShortFormApplicationService.applicationDefaults
      return
    )

    describe 'Service setup', ->
      it 'initializes applicant defaults', ->
        expectedDefault = ShortFormApplicationService.applicationDefaults.applicant
        expect(ShortFormApplicationService.applicant).toEqual expectedDefault
        return

      it 'initializes application defaults', ->
        expectedDefault = ShortFormApplicationService.applicationDefaults
        expect(ShortFormApplicationService.application).toEqual expectedDefault
        return

      it 'initializes alternateContact defaults', ->
        expectedDefault = ShortFormApplicationService.applicationDefaults.alternateContact
        expect(ShortFormApplicationService.alternateContact).toEqual expectedDefault
        return
      return

    describe 'copyHomeToMailingAddress', ->
      it 'copies applicant home address to mailing address', ->
        ShortFormApplicationService.applicant.home_address = fakeAddress
        ShortFormApplicationService.copyHomeToMailingAddress()
        expect(ShortFormApplicationService.applicant.mailing_address).toEqual ShortFormApplicationService.applicant.home_address
        return
      return

    describe 'validMailingAddress', ->
      it 'invalidates if all mailing address required values are not present', ->
        expect(ShortFormApplicationService.validMailingAddress()).toEqual false
        return
      it 'validates if all mailing address required values are present', ->
        ShortFormApplicationService.applicant.mailing_address = fakeAddress
        expect(ShortFormApplicationService.validMailingAddress()).toEqual true
        return
      return

    describe 'missingPrimaryContactInfo', ->
      it 'informs if phone_number and mailing_address are missing', ->
        expect(ShortFormApplicationService.missingPrimaryContactInfo()).toEqual ['Phone Number', 'Email', 'Mailing Address']
        return
      it 'informs if phone_number and mailing_address are not missing', ->
        ShortFormApplicationService.applicant.mailing_address = fakeAddress
        ShortFormApplicationService.applicant.phone_number = '123-123123'
        ShortFormApplicationService.applicant.email = 'email@email.com'
        expect(ShortFormApplicationService.missingPrimaryContactInfo()).toEqual []
        return
      return
