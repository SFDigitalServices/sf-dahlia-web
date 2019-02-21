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

    fakeUnitWithWithParkingPrice = {
      'Price_With_Parking': 150000,
      'Unit_Type': '2 BR',
    }
    fakeUnitWithoutAnyPrice = {
      'Unit_Type': '2 BR',
    }
    fakeUnitWithWithoutParkingPrice = {
      'Price_Without_Parking': 150000,
      'Unit_Type': '2 BR',
    }

    describe 'saleUnitStats', ->
      beforeEach ->
        ctrl = $componentController 'saleUnitStats', locals, {parent: fakeParent}
      describe 'groupHasUnitsWithParking', ->
        it 'returns true if group has a unit with parking', ->
          fakeUnitGroup = [fakeUnitWithWithParkingPrice, fakeUnitWithoutAnyPrice]
          expect(ctrl.groupHasUnitsWithParking(fakeUnitGroup)).toEqual true
        it 'returns false if group has no units with parking', ->
          fakeUnitGroup = [fakeUnitWithoutAnyPrice, fakeUnitWithoutAnyPrice]
          expect(ctrl.groupHasUnitsWithParking(fakeUnitGroup)).toEqual false

      describe 'groupHasUnitsWithoutParking', ->
        it 'returns true if group has a unit without parking', ->
          fakeUnitGroup = [fakeUnitWithWithoutParkingPrice, fakeUnitWithoutAnyPrice]
          expect(ctrl.groupHasUnitsWithoutParking(fakeUnitGroup)).toEqual true
        it 'returns false if group has no units without parking', ->
          fakeUnitGroup = [fakeUnitWithoutAnyPrice, fakeUnitWithoutAnyPrice]
          expect(ctrl.groupHasUnitsWithoutParking(fakeUnitGroup)).toEqual false
