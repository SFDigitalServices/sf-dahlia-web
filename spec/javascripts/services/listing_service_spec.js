(function() {
  'use strict';
  describe('ListingService', function() {
    var ListingService;
    var httpBackend;
    var fakeListings = getJSONFixture('/listings.json');
    var fakeListing = getJSONFixture('/listings/0.json');
    var $cookies;
    var requestURL;

    beforeEach(module('dahlia.services', function() {}));

    beforeEach(inject(function(_$httpBackend_, _ListingService_, _$cookies_) {
      httpBackend = _$httpBackend_;
      ListingService = _ListingService_;
      $cookies = _$cookies_;
      requestURL = ListingService.requestURL;
    }));

    describe('Service setup', function() {
      it('initializes defaults', function() {
        expect(ListingService.listings).toEqual([]);
      });
    });

    describe('Service.getListings', function() {
      afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
      });

      it('assigns Service.listings with an array of all listings', function() {
        stubAngularAjaxRequest(
          httpBackend,
          requestURL,
          fakeListings
        );
        ListingService.getListings();
        httpBackend.flush();
        expect(ListingService.listings).toEqual(fakeListings.listings);
      });
    });

    describe('Service.getListing', function() {
      afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
      });

      it('assigns Service.listings with an array of all listings', function() {
        stubAngularAjaxRequest(
          httpBackend,
          requestURL,
          fakeListing
        );
        ListingService.getListing(0);
        httpBackend.flush();
        expect(ListingService.listing).toEqual(fakeListing.listing);
      });
    });
  });
}());
