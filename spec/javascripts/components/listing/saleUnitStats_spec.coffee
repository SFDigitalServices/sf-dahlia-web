do ->
  'use strict'
  describe 'Sale Unit Stats Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    fakeParent = {}
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {}
    )


    fakeGroupWithAndWithoutParking = {
      'Price_Without_Parking': 520000,
      'Price_With_Parking': 580000,
    }

    fakeGroupWithoutAnyPrice = {
      'Unit_Type': '2 BR',
    }

    fakeGroupWithOnlyWithoutParkingPrice = {
      'Price_Without_Parking': 150000,
    }

    fakeGroupWithOnlyWithParkingPrice = {
      'Price_With_Parking': 150000,
    }

    describe 'saleUnitStats', ->
      beforeEach ->
        ctrl = $componentController 'saleUnitStats', locals, {parent: fakeParent}
      describe 'priceGroupHasUnitsWithParking', ->
        it 'returns true if group has a unit with parking', ->
          expect(ctrl.priceGroupHasUnitsWithParking(fakeGroupWithAndWithoutParking)).toEqual true
          expect(ctrl.priceGroupHasUnitsWithParking(fakeGroupWithOnlyWithParkingPrice)).toEqual true
        it 'returns false if group has no units with parking', ->
          expect(ctrl.priceGroupHasUnitsWithParking(fakeGroupWithOnlyWithoutParkingPrice)).toEqual false

      describe 'priceGroupHasUnitsWithoutParking', ->
        it 'returns true if group has a unit without parking', ->
          expect(ctrl.priceGroupHasUnitsWithoutParking(fakeGroupWithAndWithoutParking)).toEqual true
          expect(ctrl.priceGroupHasUnitsWithoutParking(fakeGroupWithOnlyWithoutParkingPrice)).toEqual true
        it 'returns false if group has no units without parking', ->
          expect(ctrl.priceGroupHasUnitsWithoutParking(fakeGroupWithOnlyWithParkingPrice)).toEqual false
