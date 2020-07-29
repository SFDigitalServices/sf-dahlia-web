do ->
  'use strict'
  describe 'Rental Stats Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    $translate = {
      instant: (key) -> "translated(#{key})"
    }
    fakeParent = {}
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        $translate: $translate
      }
    )

    fakeListing = {
      'unitSummaries': {
        'general': [summaryWithoutPrices, summaryWithMinWithoutParkingPrice]
        'reserved': null
      }
    }

    describe 'rentalStats', ->
      beforeEach ->
        ctrl = $componentController 'rentalStats', locals, { parent: fakeParent, listing: fakeListing }

      describe '$ctrl.availabilityText', ->
        it 'returns waitlist text if none available', ->
          summary = { availability: 0 }
          expect(ctrl.availabilityText(summary)).toEqual 'translated(listings.stats.waitlist)'

        it 'returns number available', ->
          summary = { availability: 2 }
          expect(ctrl.availabilityText(summary)).toEqual '2 translated(listings.stats.available)'

