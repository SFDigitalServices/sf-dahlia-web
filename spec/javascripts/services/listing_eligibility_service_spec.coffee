do ->
  'use strict'
  describe 'ListingService', ->
    ListingEligibilityService = undefined
    loading = {}
    error = {}
    fakeEligibilityListings = getJSONFixture('listings-api-eligibility-listings.json')
    fakeEligibilityFilters =
      household_size: 2
      income_timeframe: 'per_month'
      income_total: 3500
      include_children_under_6: true
      children_under_6: 1
    fakeListingEligibilityService = {
      # setEligibilityFilters: jasmine.createSpy()
    }
    $localStorage = undefined

    # beforeEach module('dahlia.services', ($provide) ->
    #   $provide.value '$translate', $translate
    #   $provide.value 'ModalService', fakeModalService
    #   $provide.value 'ListingEligibilityService', fakeListingEligibilityService
    #   return
    # )

    beforeEach module('dahlia.services', ->
    )

    beforeEach inject((_ListingEligibilityService_, _$localStorage_) ->
      $localStorage = _$localStorage_
      ListingEligibilityService = _ListingEligibilityService_
      return
    )

    describe 'Service.setEligibilityFilters', ->
      describe 'When filters have been set', ->
        beforeEach ->
          # reset eligibility filters
          ListingEligibilityService.setEligibilityFilters angular.copy(ListingEligibilityService.eligibility_filter_defaults)
        afterEach ->
          # reset eligibility filters
          ListingEligibilityService.setEligibilityFilters angular.copy(ListingEligibilityService.eligibility_filter_defaults)
        it 'updates Service.eligibility_filters with appropriate data', ->
          ListingEligibilityService.setEligibilityFilters(fakeEligibilityFilters)
          expect(ListingEligibilityService.eligibility_filters.income_total).toEqual 3500
          expect(ListingEligibilityService.eligibility_filters.household_size).toEqual 2
        it 'checks if eligibility filters have been set', ->
          expect(ListingEligibilityService.hasEligibilityFilters()).toEqual false
          ListingEligibilityService.setEligibilityFilters(fakeEligibilityFilters)
          expect(ListingEligibilityService.hasEligibilityFilters()).toEqual true
        it 'returns yearly income', ->
          ListingEligibilityService.setEligibilityFilters(fakeEligibilityFilters)
          expect(ListingEligibilityService.eligibilityYearlyIncome()).toEqual 3500*12
