do ->
  'use strict'
  describe 'Feature Section Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    $translate =
      instant: ->
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeParent = {
      listing: fakeListing
    }
    fakeStates = {}
    fakeTable = {
      table1: true,
      table2: false
    }
    fakeStates[fakeListing.Id] = fakeTable
    fakeListingDataService =
      listings: fakeListings
      toggleStates: fakeStates

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingDataService: fakeListingDataService
        $translate: $translate
      }
    )

    describe 'featuresSection', ->
      beforeEach ->
        ctrl = $componentController 'featuresSection', locals, {parent: fakeParent}

      describe 'toggleTable', ->
        describe "when the given table's toggle state is true", ->
          it 'set its toggle state to false', ->
            table1ToggleStateVal = fakeListingDataService.toggleStates[fakeListing.Id]['table1']
            ctrl.toggleTable('table1')
            expect(fakeListingDataService.toggleStates[fakeListing.Id]['table1']).toEqual false
        describe "when the given table's toggle state is false", ->
          it 'set its toggle state to true', ->
            table1ToggleStateVal = fakeListingDataService.toggleStates[fakeListing.Id]['table2']
            ctrl.toggleTable('table2')
            expect(fakeListingDataService.toggleStates[fakeListing.Id]['table2']).toEqual true

      describe 'formatBaths', ->
        describe 'when the given number of bathrooms is 0', ->
          it 'returns "Shared"', ->
            expect(ctrl.formatBaths(0)).toEqual('Shared')
        describe 'when the given number of bathrooms is 0.5', ->
          it 'returns "1/2 " plus the translation of the key "LISTINGS.BATH"', ->
            spyOn($translate, 'instant').and.returnValue('baths')
            output = ctrl.formatBaths(0.5)
            expect($translate.instant).toHaveBeenCalledWith('LISTINGS.BATH')
            expect(output).toEqual('1/2 ' + $translate.instant('LISTINGS.BATH'))
        describe 'when the given number of bathrooms is neither 0 nor 0.5', ->
          describe 'and it is a decimal of the format X.5', ->
            it 'returns a string consisting of the floor of the given number, plus " 1/2 ", plus the translation of the key "LISTINGS.BATH"', ->
              spyOn($translate, 'instant').and.returnValue('baths')
              output = ctrl.formatBaths(1.5)
              expect($translate.instant).toHaveBeenCalledWith('LISTINGS.BATH')
              expect(output).toEqual('1 1/2 ' + $translate.instant('LISTINGS.BATH'))
          describe 'and it is not a decimal of the format X.5', ->
            it 'returns the given number', ->
              expect(ctrl.formatBaths(1)).toEqual(1)

      describe 'listingIsBMR', ->
        it 'returns false if the listing program type is not a BMR type', ->
          ctrl.parent.listing.Program_Type = 'OCII-RENTAL'
          expect(ctrl.listingIsBMR()).toEqual false

        it 'returns true if the listing program type is a BMR type', ->
          ctrl.parent.listing.Program_Type = 'IH-RENTAL'
          expect(ctrl.listingIsBMR()).toEqual true
