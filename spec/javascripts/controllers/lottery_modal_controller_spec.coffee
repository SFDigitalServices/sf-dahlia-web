do ->
  'use strict'
  describe 'LotteryModalController', ->
    scope = undefined
    state = {current: {name: undefined}}
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeAnalyticsService = {
      trackInvalidLotteryNumber: jasmine.createSpy()
    }
    fakeListingDataService =
      listings: fakeListings
    fakeListingLotteryService =
      formatLotteryNumber: ->
      getLotteryRanking: ->

    beforeEach module('dahlia.controllers', ($provide) ->
      return
    )

    beforeEach inject(($rootScope, $controller, $q) ->
      deferred = $q.defer()
      deferred.resolve('resolveData')
      spyOn(fakeListingLotteryService, 'getLotteryRanking').and.returnValue(deferred.promise)

      scope = $rootScope.$new()
      $controller 'LotteryModalController',
        $scope: scope
        $state: state
        ListingDataService: fakeListingDataService
        ListingLotteryService: fakeListingLotteryService
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
      it 'calls ListingLotteryService.getLotteryRanking', ->
        scope.lotterySearchNumber = '22222'
        scope.listing = fakeListing
        spyOn(fakeListingLotteryService, 'formatLotteryNumber').and.returnValue(scope.lotterySearchNumber)
        scope.showLotteryRanking()
        expect(fakeListingLotteryService.getLotteryRanking).toHaveBeenCalledWith(scope.lotterySearchNumber, scope.listing)
