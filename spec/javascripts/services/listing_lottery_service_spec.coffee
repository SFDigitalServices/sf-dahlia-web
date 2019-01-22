do ->
  'use strict'
  describe 'ListingLotteryService', ->

    ListingLotteryService = undefined
    httpBackend = undefined

    fakeListing = getJSONFixture('listings-api-show.json')
    fakeLotteryBuckets = getJSONFixture('listings-api-lottery-buckets.json')
    requestURL = undefined
    tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)

    beforeEach module('dahlia.services', ->
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
        ListingLotteryService.getLotteryBuckets(fakeListing.listing)
        httpBackend.flush()
        expect(ListingLotteryService.lotteryBucketInfo[fakeListing.listing.Id]).toEqual fakeLotteryBuckets

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

    describe 'Service.lotteryDatePassed', ->
      it 'returns true if listing lottery date has passed', ->
        listing = fakeListing.listing
        listing.Lottery_Date = lastWeek.toString()
        expect(ListingLotteryService.lotteryDatePassed(listing)).toEqual true
      it 'returns false if listing lottery date has not passed', ->
        listing = fakeListing.listing
        listing.Lottery_Date = tomorrow.toString()
        expect(ListingLotteryService.lotteryDatePassed(listing)).toEqual false
