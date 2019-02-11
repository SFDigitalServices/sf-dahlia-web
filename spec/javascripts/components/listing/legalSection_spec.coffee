do ->
  'use strict'
  describe 'Legal Section Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    $translate =
      instant: jasmine.createSpy()
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeListing.Realtor_Commission_Amount = 100
    fakeParent = {
      listing: fakeListing
    }
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        $translate: $translate
      }
    )

    describe 'legalSection', ->
      beforeEach ->
        ctrl = $componentController 'legalSection', locals, {parent: fakeParent}

      describe '$ctrl.realtorCommissionMessage', ->
        it 'expects translate to be called for percent unit', ->
          fakeListing.Realtor_Commission_Unit = 'percent'
          ctrl.realtorCommissionMessage(fakeListing)
          expect($translate.instant).toHaveBeenCalled()
        it 'returns value in dollars for unit in dollars', ->
          fakeListing.Realtor_Commission_Unit = 'dollars'
          expect(ctrl.realtorCommissionMessage(fakeListing)).toEqual( " $#{fakeListing.Realtor_Commission_Amount}")
