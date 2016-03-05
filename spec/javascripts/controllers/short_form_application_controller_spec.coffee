do ->
  'use strict'
  describe 'ShortFormApplicationController', ->
    scope = undefined
    state = undefined
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeShortFormApplicationService = { application: applicant: {} }

    beforeEach module('dahlia.controllers', ($provide) ->
      fakeListingService =
        listing: fakeListing
      $provide.value 'ListingService', fakeListingService
      return
    )

    beforeEach inject(($rootScope, $controller) ->
      scope = $rootScope.$new()
      state =
        current:
          name: 'dahlia.short-form-application.overview'
      $controller 'ShortFormApplicationController',
        $scope: scope
        $state: state
        ShortFormApplicationService: fakeShortFormApplicationService
      return
    )

    describe '$scope.listing', ->
      it 'populates scope with a single listing', ->
        expect(scope.listing).toEqual fakeListing
        return
      return

    describe '$scope.hasNav', ->
      it 'shows navigation if current state is not intro', ->
        expect(scope.hasNav()).toEqual true
        return
      return

  return
