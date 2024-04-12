do ->
  'use strict'
  describe 'ListingPreferenceService', ->
    ListingPreferenceService = undefined
    httpBackend = undefined
    fakeListing = getJSONFixture('listings-api-show.json').listing
    listing = null
    fakePreferences = getJSONFixture('listings-api-listing-preferences.json')
    fakeCustomPrefs = [
      {preferenceName: 'DACA Fund', listingPreferenceID: '1233'}
      {preferenceName: 'Households with Pet Zebras', listingPreferenceID: '1234'}
    ]
    fakeListingConstantsService =
      preferenceMap:
        certOfPreference: "Certificate of Preference (COP)"
        displaced: "Displaced Tenant Housing Preference (DTHP)"
        liveWorkInSf: "Live or Work in San Francisco Preference"
        liveInSf: "Live or Work in San Francisco Preference"
        workInSf: "Live or Work in San Francisco Preference"
        neighborhoodResidence: "Neighborhood Resident Housing Preference (NRHP)"
        assistedHousing: "Rent Burdened / Assisted Housing Preference"
        rentBurden: "Rent Burdened / Assisted Housing Preference"
        antiDisplacement: "Anti-Displacement Housing Preference (ADHP)"
        aliceGriffith: "Alice Griffith Housing Development Resident"
      CUSTOM_PREFERENCE_NAMES: [
          'DACA Fund',
          'Households with Pet Zebras'
      ]
    loading = {}
    fakeListingIdentityService =
      listingIs: ->

    beforeEach module('ui.router')
    beforeEach module('http-etag')
    beforeEach module('dahlia.services', ($provide) ->
      $provide.value 'ListingConstantsService', fakeListingConstantsService
      $provide.value 'ListingIdentityService', fakeListingIdentityService
      return
    )

    beforeEach inject((_ListingPreferenceService_, _$httpBackend_) ->
      httpBackend = _$httpBackend_
      ListingPreferenceService = _ListingPreferenceService_
      return
    )

    describe 'Service.getListingPreferences', ->
      beforeEach (done) ->
        # have to populate listing first
        listing = angular.copy(fakeListing)
        listing.Id = 'fakeId-123'
        # just to divert from our hardcoding
        preferences = angular.copy(fakePreferences)
        preferences.preferences = preferences.preferences.concat fakeCustomPrefs
        stubAngularAjaxRequest httpBackend, "/api/v1/listings/#{listing.Id}/preferences", preferences
        ListingPreferenceService.getListingPreferences(listing)
        done()

      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'assigns Service.listing.preferences with the Preference results', ->
        httpBackend.flush()
        expect(listing.preferences).toEqual fakePreferences.preferences.concat fakeCustomPrefs
        expect(ListingPreferenceService.loading.preferences).toEqual false

      it 'assigns Service.listing.customPreferences with the customPreferences without proof', ->
        httpBackend.flush()
        customPrefNames = listing.customPreferences.map (pref) -> pref.preferenceName
        expectedPrefs = [
          'DACA Fund',
          'Households with Pet Zebras'
        ]
        expect(customPrefNames).toEqual(
          jasmine.arrayWithExactContents(expectedPrefs)
        )
        expect(listing.customPreferences.length).toEqual 2
        expect(ListingPreferenceService.loading.preferences).toEqual false

      it 'assigns Service.listing.customProofPreferences with the customPreferences with proof', ->
        # We don't currently have any hard-coded custom preferences, and this feature will be
        # replaced with `requiresProof` setting in #154784101
        httpBackend.flush()
        expect(listing.customProofPreferences.length).toEqual 0
        expect(ListingPreferenceService.loading.preferences).toEqual false

    describe 'Service.hasPreference', ->
      beforeEach ->
        listing = angular.copy(fakeListing)
        listing.preferences = [{preferenceName: 'Live or Work in San Francisco Preference'}]

      describe 'listing has preference', ->
        it 'should return true', ->
          expect(ListingPreferenceService.hasPreference('liveInSf', listing)).toEqual true

      describe 'listing does not have preference', ->
        it 'should return false', ->
          expect(ListingPreferenceService.hasPreference('neighborhoodResidence', listing)).toEqual false
