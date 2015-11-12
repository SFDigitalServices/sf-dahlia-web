(function() {
  'use strict';

  describe('ListingService', function() {
    jasmine.getJSONFixtures().fixturesPath = '/public/json';
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

    describe('Service.toggleFavoriteListing', function() {
      describe('When a listing is favorited', function() {
        var expectedResult = {1:true};
        var listingId = 1;

        beforeEach(function() {
          ListingService.toggleFavoriteListing(listingId);
        });

        afterEach(function() {
          $cookies.remove(listingId);
        });

        it('should store Service.favorites in cookies', function() {
          var cookieQuery = $cookies.getObject('Service.favorites');
          expect(cookieQuery).toEqual(expectedResult);
          expect(cookieQuery).toEqual(ListingService.favorites);
        });

        it('should updated Service.favorites', function() {
          expect(ListingService.favorites).toEqual(expectedResult);
        });
      });

      describe('When a favorited listing is unfavorited', function() {

        var expectedResult = {1:false};
        var listingId = 1;

        beforeEach(function() {
          ListingService.toggleFavoriteListing(listingId); //favoriting listing
          ListingService.toggleFavoriteListing(listingId); //unfavoriting listing
        });

        afterEach(function() {
          $cookies.remove(listingId);
        });

        it('should update Service.favorites in cookies', function() {
          var cookieQuery = $cookies.getObject('Service.favorites');
          expect(cookieQuery).toEqual(expectedResult);
          expect(cookieQuery).toEqual(ListingService.favorites);
        });

        it('should updated Service.favorites', function() {
          expect(ListingService.favorites).toEqual(expectedResult);
        });
      });
    });

    describe('Service.getFavorites', function() {
      describe('When a listing has been favorited', function() {
        it('updates Service.favorites with appropriate data', function() {
          ListingService.toggleFavoriteListing(1);
          ListingService.getFavorites();
          expect(ListingService.favorites).toEqual({1: true});
        });
      });
    });
  });
}());
