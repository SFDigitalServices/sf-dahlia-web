do ->
  'use strict'
  describe 'Application Summary', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined

    fakeApplication =
      preferences:
        documents:
          rentBurden: {}
        optOut: {}
      groupedHouseholdAddresses: [
        {
          address: '123 Main St'
          monthlyRent: 100
          members: []
        }
      ]
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeBindings =
      alternateContact: {}
      applicant: {}
      application: fakeApplication
      householdMembers: {}
      isRental: {}
      isSale: {}
      listing: {}
      preferences: {}

    fakeLendingInstitutionService =
      getLendingAgentName: jasmine.createSpy()
      getLendingInstitution: jasmine.createSpy()
    fakeShortFormHelperService =
      flagForI18n: jasmine.createSpy()
    fakeShortFormNavigationService =
      getStartOfSection: jasmine.createSpy()

    beforeEach module('dahlia.components')

    beforeEach inject((_$componentController_, $q) ->
      $componentController = _$componentController_
      $translate = {
        instant: jasmine.createSpy('$translate.instant').and.returnValue('newmessage')
      }
      deferred = $q.defer()
      locals =
        $filter: {}
        $state: {}
        $translate: $translate
        LendingInstitutionService: fakeLendingInstitutionService
        ShortFormHelperService: fakeShortFormHelperService
        ShortFormNavigationService: fakeShortFormNavigationService
    )

    beforeEach ->
      ctrl = $componentController 'applicationSummary', locals, fakeBindings

    describe 'claimedCustomPreference', ->
      beforeEach ->
        fakeListing = getJSONFixture('listings-api-show.json').listing
        ShortFormApplicationService.listing = fakeListing
        fakeCustomPreference =
          listingPreferenceID: '123456'
        ShortFormApplicationService.listing.customPreferences = [fakeCustomPreference]

    #   it 'returns true if custom preferences were claimed', ->
    #     ShortFormApplicationService.preferences = {'123456': true}
    #     expect(ShortFormApplicationService.claimedCustomPreference(fakeCustomPreference)).toEqual true

    #   it 'returns false if custom preferences were not claimed', ->
    #     ShortFormApplicationService.preferences = {'liveInSf': true}
    #     expect(ShortFormApplicationService.claimedCustomPreference(fakeCustomPreference)).toEqual false

    # describe 'fileAttachmentsForRentBurden', ->
    #   it 'called on fileAttachmentsForRentBurden on ShortFormHelperService', ->
    #     ctrl.fileAttachmentsForRentBurden()
    #     expect(fakeShortFormHelperService.fileAttachmentsForRentBurden).toHaveBeenCalled()

    describe 'getLendingAgentName', ->
      it 'should call LendingInstitutionService.getLendingAgentName with the given agent ID', ->
        id = 1234
        ctrl.getLendingAgentName(id)
        expect(fakeLendingInstitutionService.getLendingAgentName)
          .toHaveBeenCalledWith(id)

    describe 'getLendingInstitution', ->
      it 'should call LendingInstitutionService.getLendingInstitution with the given agent ID', ->
        id = 1234
        ctrl.getLendingInstitution(id)
        expect(fakeLendingInstitutionService.getLendingInstitution)
          .toHaveBeenCalledWith(id)
