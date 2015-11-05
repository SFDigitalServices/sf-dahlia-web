// 'use strict';

// describe('ListingController', function() {
//   // jasmine.getJSONFixtures().fixturesPath = '/public/json';
//   var scope;
//   var state;
//   var fakeListingService;
//   var fakeListings = getJSONFixture('/listings.json').listings;
//   var fakeListing = getJSONFixture('/listings/0.json').listing;

//   beforeEach(module('ccp.controllers', function($provide) {
//     fakeListingService = {
//       listings: fakeListings,
//       listing: fakeListing,
//     };

//     $provide.value('ListingService', fakeListingService);
//   }));

//   beforeEach(inject(function($rootScope, $controller) {
//     scope = $rootScope.$new();
//     $controller('ListingController', {
//       $scope: scope,
//       $state: state,
//     });
//   }));

//   describe('$scope.listings', function() {
//     it('populates scope with array of listings', function() {
//       expect(scope.listings).toEqual(fakeListings);
//     });
//   });

// });
