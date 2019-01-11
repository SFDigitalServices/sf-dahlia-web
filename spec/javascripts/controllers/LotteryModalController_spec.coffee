do ->
  'use strict'
  describe 'LotteryModalController', ->
    scope = undefined
    state = {current: {name: undefined}}
    listing = undefined
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeAnalyticsService = {
      trackInvalidLotteryNumber: jasmine.createSpy()
    }
    fakeListingService =
      listings: fakeListings
      getLotteryRanking: () -> null
      formatLotteryNumber: () -> null

    beforeEach module('dahlia.controllers', ($provide) ->
      $provide.value 'ListingService', fakeListingService
      $provide.value 'AnalyticsService', fakeAnalyticsService
      return
    )

    beforeEach inject(($rootScope, $controller, $q) ->
      deferred = $q.defer()
      deferred.resolve('resolveData')
      spyOn(fakeListingService, 'getLotteryRanking').and.returnValue(deferred.promise)

      scope = $rootScope.$new()
      $controller 'LotteryModalController',
        $scope: scope
        $state: state
        ListingService: fakeListingService
        AnalyticsService: fakeAnalyticsService
      return
    )

    describe '$scope.applicantSelectedForPreference', ->
      describe 'applicant is selected for lottery preference', ->
        it 'returns true', ->
          scope.lotteryRankingInfo =
            lotteryBuckets:[{preferenceResults: [{preferenceRank: 1}]}]
          expect(scope.applicantSelectedForPreference()).toEqual(true)

      describe 'applicant was not selected for lottery preference', ->
        it 'returns false', ->
          scope.lotteryRankingInfo =
            lotteryBuckets:[{preferenceResults: []}]
          expect(scope.applicantSelectedForPreference()).toEqual(false)

    describe '$scope.lotteryNumberValid', ->
      describe 'invalid', ->
        it 'returns false', ->
          scope.lotteryRankingInfo =
            lotteryBuckets:[{preferenceResults: []}]
          expect(scope.lotteryNumberValid()).toEqual(false)

      describe 'valid', ->
        it 'returns true', ->
          scope.lotteryRankingInfo =
            lotteryBuckets:[{preferenceResults: [{preferenceRank: 1}]}]
          expect(scope.lotteryNumberValid()).toEqual(true)

    describe 'showLotteryRanking', ->
      it 'calls ListingService.getLotteryRanking', ->
        scope.lotterySearchNumber = '22222'

        scope.showLotteryRanking()
        expect(fakeListingService.getLotteryRanking).toHaveBeenCalledWith(scope.lotterySearchNumber)