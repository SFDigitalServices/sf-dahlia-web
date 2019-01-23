do ->
  'use strict'
  describe 'ListingPreferencesService', ->
    ListingPreferencesService = undefined
    httpBackend = undefined
    listing = null
    fakeListing = getJSONFixture('listings-api-show.json')
    fakeListingConstantsService = {
      defaultApplicationURLs: [{
        'language': 'Spanish'
        'label': 'EspaÃ±ol'
        'url': 'http://url.com'
      }]
      LISTING_MAP: {}
    }
    fakeAMI = getJSONFixture('listings-api-ami.json')
    loading = {}
    error = {}
    fakePreferences = getJSONFixture('listings-api-listing-preferences.json')
    fakeCustomPrefs = [
          {preferenceName: 'DACA Fund', listingPreferenceID: '1233'}
          {preferenceName: 'Households with Pet Zebras', listingPreferenceID: '1234'}
        ]
    fakeListingHelperService =
      listingIs: ->
      isFirstComeFirstServe: ->
      isOpen: ->

    beforeEach module('ui.router')
    beforeEach module('http-etag')
    beforeEach module('dahlia.services', ($provide) ->
      $provide.value 'ListingConstantsService', fakeListingConstantsService
      $provide.value 'ListingHelperService', fakeListingHelperService
      return
    )

    beforeEach inject((_ListingPreferencesService_, _$httpBackend_) ->
      httpBackend = _$httpBackend_
      ListingPreferencesService = _ListingPreferencesService_
      # requestURL = ListingDataService.requestURL
      return
    )

    describe 'Service.getListingPreferences', ->
      beforeEach ->
        # have to populate listing first
        listing = angular.copy(fakeListing.listing)
        listing.Id = 'fakeId-123'
        # just to divert from our hardcoding
        preferences = angular.copy(fakePreferences)
        preferences.preferences = preferences.preferences.concat fakeCustomPrefs
        stubAngularAjaxRequest httpBackend, requestURL, preferences
        ListingPreferencesService.getListingPreferences(listing)

      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'assigns Service.listing.preferences with the Preference results', ->
        httpBackend.flush()
        expect(listing.preferences).toEqual fakePreferences.preferences.concat fakeCustomPrefs
        expect(loading.preferences).toEqual false

      it 'assigns Service.listing.customPreferences with the customPreferences without proof', ->
        httpBackend.flush()
        expect(listing.customPreferences[0].preferenceName).toEqual 'DACA Fund'
        expect(listing.customPreferences.length).toEqual 2
        expect(loading.preferences).toEqual false

      it 'assigns Service.listing.customProofPreferences with the customPreferences with proof', ->
        # We don't currently have any hard-coded custom preferences, and this feature will be
        # replaced with `requiresProof` setting in #154784101
        httpBackend.flush()
        expect(listing.customProofPreferences.length).toEqual 0
        expect(ListingPreferencesService.loading.preferences).toEqual false

    describe 'Service.hasPreference', ->
      describe 'listing has preference', ->
        it 'should return true', ->
          listing.preferences = [{preferenceName: 'Live or Work in San Francisco Preference'}]
          expect(ListingPreferencesService.hasPreference('liveInSf', listing)).toEqual true

      describe 'listing does not have preference', ->
        it 'should return false', ->
          listing.preferences = [{preferenceName: 'Live or Work in San Francisco Preference'}]
          expect(ListingPreferencesService.hasPreference('neighborhoodResidence', listing)).toEqual false
