do ->
  'use strict'
  describe 'LotteryModalController', ->
    scope = undefined
    state = {current: {name: undefined}}
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeShortFormApplicationService =
      application: {}
    fakeListingDataService =
      listing: fakeListing
      listings: fakeListings
    fakeListingLotteryService =
      lotteryBucketInfo: {}
      lotteryRankingInfo: {}
      formatLotteryNumber: ->
      getLotteryRanking: ->
    fakeShortFormApplicationService = {}

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
        ShortFormApplicationService: fakeShortFormApplicationService
      return
    )

    describe '$scope.applicantSelectedForPreference', ->
      beforeEach ->
        scope.lotteryRankingInfo = {}
      afterEach ->
        scope.lotteryRankingInfo = {}

      describe 'applicant is selected for lottery preference', ->
        it 'returns true', ->
          scope.lotteryRankingInfo[fakeListing.Id] =
            lotteryBuckets:[{preferenceResults: [{preferenceRank: 1}]}]
          expect(scope.applicantSelectedForPreference()).toEqual(true)

      describe 'applicant was not selected for lottery preference', ->
        it 'returns false', ->
          scope.lotteryRankingInfo[fakeListing.Id] =
            lotteryBuckets:[{preferenceResults: []}]
          expect(scope.applicantSelectedForPreference()).toEqual(false)

    describe '$scope.lotteryNumberValid', ->
      beforeEach ->
        scope.lotteryRankingInfo = {}
      afterEach ->
        scope.lotteryRankingInfo = {}

      describe 'invalid', ->
        it 'returns false', ->
          scope.lotteryRankingInfo[fakeListing.Id] =
            lotteryBuckets:[{preferenceResults: []}]
          expect(scope.lotteryNumberValid()).toEqual(false)

      describe 'valid', ->
        it 'returns true', ->
          scope.lotteryRankingInfo[fakeListing.Id] =
            lotteryBuckets:[{preferenceResults: [{preferenceRank: 1}]}]
          expect(scope.lotteryNumberValid()).toEqual(true)

    describe 'showLotteryRanking', ->
      it 'calls ListingLotteryService.getLotteryRanking', ->
        scope.lotterySearchNumber = '22222'
        scope.listing = fakeListing
        spyOn(fakeListingLotteryService, 'formatLotteryNumber').and.returnValue(scope.lotterySearchNumber)
        scope.showLotteryRanking()
        expect(fakeListingLotteryService.getLotteryRanking).toHaveBeenCalledWith(scope.lotterySearchNumber, scope.listing)

    describe 'viewingMyApplications', ->
      afterEach ->
        state = {current: {name: undefined}}

      it 'returns true if the current state name is "dahlia.my-applications"', ->
        state.current.name = 'dahlia.my-applications'
        expect(scope.viewingMyApplications()).toEqual(true)
      it 'returns false if the current state name is not "dahlia.my-applications"', ->
        state.current.name = 'dahlia.listing'
        expect(scope.viewingMyApplications()).toEqual(false)
