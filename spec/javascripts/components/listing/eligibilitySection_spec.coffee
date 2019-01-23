do ->
  'use strict'
  describe 'Eligibility Section Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    $translate =
      instant: ->
    fakeListings = getJSONFixture('listings-api-index.json').listings
    fakeListing = getJSONFixture('listings-api-show.json').listing
    fakeAMI = getJSONFixture('listings-api-ami.json')
    fakeParent = {
      listing: fakeListing
    }
    fakeListingService =
      AMICharts: []
      listings: fakeListings
      occupancyIncomeLevels: ->
      householdAMIChartCutoff: ->
      getListingPreferences: jasmine.createSpy()
      incomeForHouseholdSize: jasmine.createSpy()
    fakeListingHelperService =
      priorityLabel: jasmine.createSpy()
    fakeListingUnitService =
      listingHasPriorityUnits: jasmine.createSpy()
      listingHasOnlySROUnits: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        $translate: $translate
        ListingService: fakeListingService
        ListingHelperService: fakeListingHelperService
        ListingUnitService: fakeListingUnitService
      }
    )

    describe 'eligibilitySection', ->
      beforeEach ->
        ctrl = $componentController 'eligibilitySection', locals, {parent: fakeParent}

      describe 'occupancy', ->
        it 'returns 1 for SRO', ->
          unitSummary = { minOccupancy: 1 , maxOccupancy: 1 }
          expect(ctrl.occupancy(unitSummary)).toEqual('1')
        it 'returns a range for all other unit types', ->
          unitSummary = { minOccupancy: 1 , maxOccupancy: 3 }
          expect(ctrl.occupancy(unitSummary)).toEqual('1-3')

      describe 'occupancyLabel', ->
        describe 'when maxOccupancy == 1', ->
          it 'calls $translate.instant with "LISTINGS.PERSON"', ->
            spyOn($translate, 'instant')
            ctrl.occupancyLabel(1)
            expect($translate.instant).toHaveBeenCalledWith('LISTINGS.PERSON')
        describe 'when maxOccupancy != 1', ->
          it 'calls $translate.instant with "LISTINGS.PEOPLE"', ->
            spyOn($translate, 'instant')
            ctrl.occupancyLabel(2)
            expect($translate.instant).toHaveBeenCalledWith('LISTINGS.PEOPLE')

      describe 'showAMItoggler', ->
        it 'returns false for empty AMICharts', ->
          expect(ctrl.showAMItoggler()).toBe(false)
        it 'calls ListingService.occupancyIncomeLevels', ->
          fakeListingService.AMICharts = fakeAMI
          spyOn(fakeListingService, 'occupancyIncomeLevels')
          ctrl.showAMItoggler()
          expect(fakeListingService.occupancyIncomeLevels).toHaveBeenCalledWith(fakeListing, _.last(fakeAMI))
        it 'calls ListingService.householdAMIChartCutoff', ->
          fakeListingService.AMICharts = fakeAMI
          spyOn(fakeListingService, 'householdAMIChartCutoff')
          ctrl.showAMItoggler()
          expect(fakeListingService.householdAMIChartCutoff).toHaveBeenCalled()
        it 'returns true when maxNumOfHousehold is > householdAMIChartCutoff', ->
          fakeListingService.AMICharts = fakeAMI
          fakeOccupancyIncomeLevel = {
            numOfHousehold: 5
          }
          fakeOccupancyIncomeLevel2 = {
            numOfHousehold: 3
          }
          spyOn(fakeListingService, 'occupancyIncomeLevels').and.returnValue([fakeOccupancyIncomeLevel, fakeOccupancyIncomeLevel2])
          spyOn(fakeListingService, 'householdAMIChartCutoff').and.returnValue(4)
          expect(ctrl.showAMItoggler()).toEqual true
        it 'returns false when maxNumOfHousehold is < householdAMIChartCutoff', ->
          fakeListingService.AMICharts = fakeAMI
          fakeOccupancyIncomeLevel = {
            numOfHousehold: 5
          }
          fakeOccupancyIncomeLevel2 = {
            numOfHousehold: 3
          }
          spyOn(fakeListingService, 'occupancyIncomeLevels').and.returnValue([fakeOccupancyIncomeLevel, fakeOccupancyIncomeLevel2])
          spyOn(fakeListingService, 'householdAMIChartCutoff').and.returnValue(6)
          expect(ctrl.showAMItoggler()).toEqual false

      describe 'hasMultipleAMICharts', ->
        it 'returns true when there are 2 or more AMI charts', ->
          fakeListingService.AMICharts = [1,2]
          expect(ctrl.hasMultipleAMICharts()).toEqual true
        it 'returns false when there is 1 or fewer AMI charts', ->
          fakeListingService.AMICharts = [1]
          expect(ctrl.hasMultipleAMICharts()).toEqual false

      describe 'listingHasPreferences', ->
        it "returns true if the parent's listing has at least one preference", ->
          fakeListing.preferences = [1]
          expect(ctrl.listingHasPreferences()).toEqual true
        it "returns false if the parent's listing has no preferences", ->
          fakeListing.preferences = []
          expect(ctrl.listingHasPreferences()).toEqual false

      describe 'listingHasOnlySROUnits', ->
        it "calls ListingUnitService.listingHasOnlySROUnits with the parent's listing", ->
          ctrl.listingHasOnlySROUnits()
          expect(fakeListingUnitService.listingHasOnlySROUnits).toHaveBeenCalledWith(fakeListing)

      describe 'getListingPreferences', ->
        it 'calls ListingService.getListingPreferences', ->
          ctrl.getListingPreferences()
          expect(fakeListingService.getListingPreferences).toHaveBeenCalled()

      describe 'listingHasPriorityUnits', ->
        it "calls ListingUnitService.listingHasPriorityUnits with the parent's listing", ->
          ctrl.listingHasPriorityUnits()
          expect(fakeListingUnitService.listingHasPriorityUnits).toHaveBeenCalledWith(fakeListing)

      describe 'priorityLabel', ->
        it 'calls ListingHelperService.priorityLabel with the given arguments', ->
          ctrl.priorityLabel(1, 2)
          expect(fakeListingHelperService.priorityLabel).toHaveBeenCalledWith(1, 2)

      describe 'occupancyIncomeLevels', ->
        it "calls ListingService.occupancyIncomeLevels with the parent's listing and the given amiLevel", ->
          spyOn(fakeListingService, 'occupancyIncomeLevels')
          ctrl.occupancyIncomeLevels(1)
          expect(fakeListingService.occupancyIncomeLevels).toHaveBeenCalledWith(fakeListing, 1)

      describe 'householdAMIChartCutoff', ->
        it 'calls ListingService.householdAMIChartCutoff', ->
          spyOn(fakeListingService, 'householdAMIChartCutoff')
          ctrl.householdAMIChartCutoff()
          expect(fakeListingService.householdAMIChartCutoff).toHaveBeenCalled()

      describe 'incomeForHouseholdSize', ->
        it 'calls ListingService.incomeForHouseholdSize with the given arguments', ->
          ctrl.incomeForHouseholdSize(1, 2)
          expect(fakeListingService.incomeForHouseholdSize).toHaveBeenCalledWith(1, 2)
