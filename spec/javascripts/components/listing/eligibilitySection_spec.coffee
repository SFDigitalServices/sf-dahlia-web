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
      listingHasOnlySROUnits: jasmine.createSpy()
      listingHasPriorityUnits: jasmine.createSpy()
      occupancyIncomeLevels: ->
      householdAMIChartCutoff: ->
      getListingPreferences: jasmine.createSpy()
      incomeForHouseholdSize: jasmine.createSpy()
    fakeListingHelperService =
      priorityLabel: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        ListingService: fakeListingService
        $translate: $translate
        ListingHelperService: fakeListingHelperService
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
        it 'calls translate person for 1', ->
          spyOn($translate, 'instant')
          ctrl.occupancyLabel(1)
          expect($translate.instant).toHaveBeenCalledWith('LISTINGS.PERSON')
        it 'calls translate people for more than 1', ->
          spyOn($translate, 'instant')
          ctrl.occupancyLabel(2)
          expect($translate.instant).toHaveBeenCalledWith('LISTINGS.PEOPLE')

      describe 'listingHasOnlySROUnits', ->
        it 'calls ListingService.listingHasOnlySROUnits', ->
          ctrl.listingHasOnlySROUnits()
          expect(fakeListingService.listingHasOnlySROUnits).toHaveBeenCalled()

      describe 'listingHasPriorityUnits', ->
        it 'calls ListingService.listingHasPriorityUnits', ->
          ctrl.listingHasPriorityUnits()
          expect(fakeListingService.listingHasPriorityUnits).toHaveBeenCalledWith(fakeListing)

      describe 'showAMItoggler', ->
        it 'calls false for empty AMICharts', ->
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
        it 'calls ListingService.AMICharts', ->
          ctrl.hasMultipleAMICharts()
          spyOn(fakeListingService, 'AMICharts').and.returnValue([])
          expect(fakeListingService.AMICharts).toHaveBeenCalled
        it 'calls true for ListingService.AMICharts >= 2', ->
          fakeListingService.AMICharts = [1,2]
          expect(ctrl.hasMultipleAMICharts()).toEqual true
        it 'calls false for ListingService.AMICharts <= 1', ->
          fakeListingService.AMICharts = [1]
          expect(ctrl.hasMultipleAMICharts()).toEqual false

      describe 'listingHasPreferences', ->
        it 'calls parent.listing.preferences', ->
          fakeListing.preferences = -> null
          spyOn(fakeListing, 'preferences')
          ctrl.listingHasPreferences()
          expect(fakeParent.preferences).toHaveBeenCalled
        it 'calls true if parent has at least one preference', ->
          fakeListing.preferences = [1]
          expect(ctrl.listingHasPreferences()).toEqual true
        it 'calls false for empty preferences', ->
          fakeListing.preferences = []
          expect(ctrl.listingHasPreferences()).toEqual false

      describe 'getListingPreferences', ->
        it 'calls ListingService.getListingPreferences', ->
          ctrl.getListingPreferences()
          expect(fakeListingService.getListingPreferences).toHaveBeenCalled

      describe 'priorityLabel', ->
        it 'calls ListingService.priorityLabel', ->
          ctrl.priorityLabel()
          expect(fakeListingService.priorityLabel).toHaveBeenCalled

      describe 'householdAMIChartCutoff', ->
        it 'calls ListingService.householdAMIChartCutoff', ->
          ctrl.householdAMIChartCutoff()
          expect(fakeListingService.householdAMIChartCutoff).toHaveBeenCalled

      describe 'incomeForHouseholdSize', ->
        it 'calls ListingService.incomeForHouseholdSize', ->
          ctrl.incomeForHouseholdSize()
          expect(fakeListingService.incomeForHouseholdSize).toHaveBeenCalled