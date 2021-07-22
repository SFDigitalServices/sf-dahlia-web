do ->
  'use strict'
  describe 'Preferences Summary Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    $filter = undefined
    $translate = undefined
    fakeCustomPreference = listingPreferenceID: '123456'
    fakeShortFormApplicationService =
      listing: {
        'Lottery_Date': '2019-04-30',
        'customPreferences': [fakeCustomPreference]
      }

    fakeListingConstantsService = {}
    fakeShortFormHelperService =
      fileAttachmentsForRentBurden: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach module('customFilters', ($provide) ->)

    beforeEach inject((_$componentController_, _$filter_) ->
      $componentController = _$componentController_
      $translate = {
        instant: jasmine.createSpy('$translate.instant').and.callFake((key, params) ->
          result = "translated:#{key}"
          if params then result + ", #{JSON.stringify(params)}" else result
        )
      }
      $filter =  _$filter_
      locals = {
        ListingConstantsService: fakeListingConstantsService
        ShortFormApplicationService: fakeShortFormApplicationService
        ShortFormHelperService: fakeShortFormHelperService
        $state: {}
        $translate: $translate
      }
    )

    beforeEach ->
      ctrl = $componentController 'preferencesSummary', locals

    describe 'claimedCustomPreference', ->
      beforeEach ->
        fakeListing = getJSONFixture('listings-api-show.json').listing
        fakeShortFormApplicationService.listing = fakeListing

      it 'returns true if custom preferences were claimed', ->
        fakeShortFormApplicationService.preferences = {'123456': true}
        expect(ctrl.claimedCustomPreference(fakeCustomPreference)).toEqual true

      it 'returns false if custom preferences were not claimed', ->
        fakeShortFormApplicationService.preferences = {'liveInSf': true}
        expect(ctrl.claimedCustomPreference(fakeCustomPreference)).toEqual false

    describe 'fileAttachmentsForRentBurden', ->
      beforeEach ->
        ctrl.application = {
          'status': 'draft',
          'preferences': {
            'documents': {
              'rentBurden': {
                '123 Address St.': {
                  'lease': {'proofOption': 'Copy of Lease'},
                  'rent': {
                    'randomId1': {'proofOption': 'rentProof1', 'file': true},
                    'randomId2': {'proofOption': 'rentProof2', 'file': true}
                  }
                }
              }
            }
          }
        }

      describe 'when application is submitted', ->
        it 'returns default labels if application is submitted', ->
          ctrl.application.status = 'submitted'
          expectedLabels = [{
            subLabel: 'translated:label.for_your_household',
            boldSubLabel: 'translated:label.file_attached, {"file":"Lease and rent proof"}'
          }]
          expect(ctrl.fileAttachmentsForRentBurden()).toEqual expectedLabels
      describe 'when application is not submitted', ->
        it 'returns appropriate labels if one address is provided with multiple rent docs', ->
          expectedLabels = [{
            subLabel: 'translated:label.for_user, {"user":"123 Address St."}',
            boldSubLabel: 'translated:label.file_attached, {"file":"Copy of Lease, rentProof1 and rentProof2"}'
          }]
          expect(ctrl.fileAttachmentsForRentBurden()).toEqual expectedLabels

          expect($translate.instant.calls.allArgs()).toEqual([
            ['label.for_user', { user: '123 Address St.' }],
            ['label.file_attached', { file: 'Copy of Lease, rentProof1 and rentProof2' }]
          ])

        it 'returns appropriate labels if multiple addresses are provided', ->
          ctrl.application.preferences.documents.rentBurden['456 Address St.'] = {
            'lease': {'proofOption': 'Copy of Lease'},
            'rent': {'randomId2': {'proofOption': 'rentProof2', 'file': true}}
          }

          labels = ctrl.fileAttachmentsForRentBurden()
          expect(labels.length).toEqual 2
          expect($translate.instant.calls.allArgs()).toEqual([
            ['label.for_user', { user: '123 Address St.' }],
            ['label.file_attached', { file: 'Copy of Lease, rentProof1 and rentProof2' }]
            ['label.for_user', { user: '456 Address St.' }],
            ['label.file_attached', { file: 'Copy of Lease and rentProof2' }]
          ])
    describe 'formatAndSortPrefs', ->
      beforeEach ->
        fakeShortFormApplicationService.preferences = {
          'sample_pref_id': true
        }
        ctrl.application =
          householdMembers: []
          applicant:
            id: 1,
            firstName: 'Jane',
            lastName: 'Doe',
        ctrl.application.preferences =
          sample_pref_id: true
          sample_pref_id_household_member: 1
          sample_pref_id_shortformPreferenceID: "a0w3K000000fmPIQAY"
          documents: {}
        ctrl.listing =
          customPreferences: [{
            preferenceName: "Custom Pref with Certificate",
            order: 4,
            listingPreferenceID: "sample_pref_id",
          }]

      it 'includes certificate number for custom prefs with cert numbers', ->
        ctrl.application.preferences['sample_pref_id_certificateNumber'] = "tida_cert"
        result = ctrl.formatAndSortPrefs()
        expect(result[0].boldSubLabel).toEqual('translated:label.certificate_number: tida_cert')
        expect(result[0].subLabel).toEqual('translated:label.for_user, {"user":"Jane Doe"}')

      it 'does not include cert number for custom prefs w/o cert number', ->
        result = ctrl.formatAndSortPrefs()
        expect(result[0].boldSubLabel).toEqual('')
