do ->
  'use strict'
  describe 'ListingLotteryService', ->
    ListingLotteryService = undefined
    httpBackend = undefined
    fakeModalService =
      modalInstance: {}
      openModal: jasmine.createSpy()
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeLotteryBuckets = getJSONFixture('listings-api-lottery-buckets.json')
    fakeLotteryRanking = getJSONFixture('listings-api-lottery-ranking.json')
    requestURL = undefined
    tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    beforeEach module('dahlia.services', ($provide) ->
      $provide.value 'ModalService', fakeModalService
      return
    )

    beforeEach inject((_ListingLotteryService_, _$httpBackend_) ->
      httpBackend = _$httpBackend_
      ListingLotteryService = _ListingLotteryService_
      requestURL = ListingLotteryService.requestURL
      return
    )

    describe 'Service setup', ->
      it 'initializes property lotteryBucketInfo as empty object', ->
        expect(ListingLotteryService.lotteryBucketInfo).toEqual {}
      it 'initializes property lotteryRankingInfo as empty object', ->
        expect(ListingLotteryService.lotteryRankingInfo).toEqual {}
      it 'initializes property loading as empty object', ->
        expect(ListingLotteryService.loading).toEqual {}

    describe 'Service.getLotteryBuckets', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'adds the buckets for the given listings to Service.lotteryBucketInfo', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeLotteryBuckets
        ListingLotteryService.getLotteryBuckets(fakeListing)
        httpBackend.flush()
        expect(ListingLotteryService.lotteryBucketInfo[fakeListing.Id]).toEqual fakeLotteryBuckets

    describe 'Service.listingHasLotteryBuckets', ->
      it 'returns false when no listing is given', ->
        expect(ListingLotteryService.listingHasLotteryBuckets()).toEqual false

      it 'returns false when no lottery bucket info is present', ->
        ListingLotteryService.lotteryBucketInfo = {}
        expect(ListingLotteryService.listingHasLotteryBuckets(fakeListing)).toEqual false

      it 'returns false when no lottery bucket info is present for the given listing', ->
        ListingLotteryService.lotteryBucketInfo =
          foo: { bar: 0, baz: 1 }
        expect(ListingLotteryService.listingHasLotteryBuckets(fakeListing)).toEqual false

      it 'returns true when lottery bucket info is present for the given listing', ->
        fakeLotteryBuckets[fakeListing.Id] =
          lotteryBuckets: [
            { preferenceResults: {bar: 0, baz: 1} }
          ]
        ListingLotteryService.lotteryBucketInfo = fakeLotteryBuckets
        expect(ListingLotteryService.listingHasLotteryBuckets(fakeListing)).toEqual true

    describe 'Service.listingHasLotteryResults', ->
      it 'returns true if lottery PDF is available', ->
        fakeListing.LotteryResultsURL = 'http://pdf.url'
        expect(ListingLotteryService.listingHasLotteryResults(fakeListing)).toEqual true

      it 'returns true if lottery buckets are available', ->
        fakeListing.LotteryResultsURL = null
        spyOn(ListingLotteryService, 'listingHasLotteryBuckets').and.returnValue(true)
        expect(ListingLotteryService.listingHasLotteryResults(fakeListing)).toEqual true

      it 'returns false if neither the lottery PDF nor the lottery are available', ->
        fakeListing.LotteryResultsURL = null
        spyOn(ListingLotteryService, 'listingHasLotteryBuckets').and.returnValue(false)
        expect(ListingLotteryService.listingHasLotteryResults(fakeListing)).toEqual false

    describe 'Service.lotteryComplete', ->
      it "returns true when the listing's lottery status is \"Listing Complete\" and Publish_Lottery_Results is true", ->
        fakeListing.Lottery_Status = 'Lottery Complete'
        fakeListing.Publish_Lottery_Results_on_DAHLIA = 'Publish results in lottery modal on DAHLIA'
        expect(ListingLotteryService.lotteryComplete(fakeListing)).toEqual true

      it "returns false when the listing's lottery status is not \"Listing Complete\"", ->
        fakeListing.Lottery_Status = 'Not Yet Run'
        fakeListing.Publish_Lottery_Results_on_DAHLIA = 'Publish results in lottery modal on DAHLIA'
        expect(ListingLotteryService.lotteryComplete(fakeListing)).toEqual false

      it "returns false when the listing.Publish_Lottery_Results_on_DAHLIA is \"Not published\"", ->
        fakeListing.Lottery_Status = 'Lottery Complete'
        fakeListing.Publish_Lottery_Results_on_DAHLIA = 'Not published'
        expect(ListingLotteryService.lotteryComplete(fakeListing)).toEqual false

      it "returns false when the listing.Publish_Lottery_Results_on_DAHLIA is null", ->
        fakeListing.Lottery_Status = 'Lottery Complete'
        fakeListing.Publish_Lottery_Results_on_DAHLIA = null
        expect(ListingLotteryService.lotteryComplete(fakeListing)).toEqual false


    describe 'Service.openLotteryResultsModal', ->
      beforeEach ->
        ListingLotteryService.openLotteryResultsModal()

      it 'should set the loading and error flags for lottery rank to false', ->
        expect(ListingLotteryService.loading.lotteryRank).toEqual false
        expect(ListingLotteryService.error.lotteryRank).toEqual false

      it 'should call ModalService.openModal with the appropriate template and class', ->
        templateUrl = 'listings/templates/listing/_lottery_modal.html'
        windowClass = 'modal-small'
        expect(fakeModalService.openModal).toHaveBeenCalledWith(templateUrl, windowClass)

    describe 'Service.formatLotteryNumber', ->
      it 'removes any extraneous formatting from lottery numbers', ->
        formatted = '00041990'
        val = ListingLotteryService.formatLotteryNumber('# 41990')
        expect(val).toEqual(formatted)
        val = ListingLotteryService.formatLotteryNumber('#041990')
        expect(val).toEqual(formatted)
        val = ListingLotteryService.formatLotteryNumber('41990')
        expect(val).toEqual(formatted)
        val = ListingLotteryService.formatLotteryNumber(formatted)
        expect(val).toEqual(formatted)

    describe 'Service.getLotteryRanking', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'assigns Service.lotteryRankingInfo with ranking results', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeLotteryRanking
        ListingLotteryService.getLotteryRanking('00042084', fakeListing)
        ranking = angular.copy(fakeLotteryRanking)
        ranking.submitted = true
        httpBackend.flush()
        expect(ListingLotteryService.lotteryRankingInfo[fakeListing.Id]).toEqual ranking
