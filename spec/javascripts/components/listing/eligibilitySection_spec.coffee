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
    fakeListingEligibilityService = {
      occupancyIncomeLevels: ->
      incomeForHouseholdSize: jasmine.createSpy()
      householdAMIChartCutoff: ->
    }
    fakeListingDataService =
      AMICharts: []
      listing: fakeListing
      listings: fakeListings
      priorityLabel: jasmine.createSpy()
    fakeListingPreferenceService = {
      getListingPreferences: jasmine.createSpy()
    }
    fakeListingUnitService =
      listingHasPriorityUnits: jasmine.createSpy()
      listingHasOnlySROUnits: jasmine.createSpy()

    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_) ->
      $componentController = _$componentController_
      locals = {
        $translate: $translate
        ListingDataService: fakeListingDataService
        ListingPreferenceService: fakeListingPreferenceService
        ListingUnitService: fakeListingUnitService
        ListingEligibilityService: fakeListingEligibilityService
      }
    )

    describe 'eligibilitySection', ->
      beforeEach ->
        ctrl = $componentController 'eligibilitySection', locals, {parent: fakeParent}

      describe 'occupancy', ->
        describe 'maxOccupancy is 1', ->
          it 'returns minOccupancy value', ->
            unitSummary = { minOccupancy: 1 , maxOccupancy: 1 }
            expect(ctrl.occupancy(unitSummary)).toEqual('at least 1 person')
        describe 'is an SRO unit', ->
          it 'returns 1', ->
            unitSummary = { minOccupancy: 1 , maxOccupancy: 1 }
            expect(ctrl.occupancy(unitSummary)).toEqual('at least 1 person')
        describe 'maxOccupancy is null', ->
          it 'returns minOccupancy value', ->
            unitSummary = { minOccupancy: 3 , maxOccupancy: null }
            expect(ctrl.occupancy(unitSummary)).toEqual('at least 3 people')
        describe 'all other unit types', ->
          it 'returns a range for all other unit types', ->
            unitSummary = { minOccupancy: 2 , maxOccupancy: 3 }
            expect(ctrl.occupancy(unitSummary)).toEqual('2-3 people')

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
        it 'calls ListingEligibilityService.occupancyIncomeLevels', ->
          fakeListingDataService.AMICharts = fakeAMI
          spyOn(fakeListingEligibilityService, 'occupancyIncomeLevels')
          ctrl.showAMItoggler()
          expect(fakeListingEligibilityService.occupancyIncomeLevels).toHaveBeenCalledWith(fakeListing, _.last(fakeAMI))
        it 'calls ListingEligibilityService.householdAMIChartCutoff', ->
          fakeListingDataService.AMICharts = fakeAMI
          spyOn(fakeListingEligibilityService, 'householdAMIChartCutoff')
          ctrl.showAMItoggler()
          expect(fakeListingEligibilityService.householdAMIChartCutoff).toHaveBeenCalled()
        it 'returns true when maxNumOfHousehold is > householdAMIChartCutoff', ->
          fakeListingDataService.AMICharts = fakeAMI
          fakeOccupancyIncomeLevel = {
            numOfHousehold: 5
          }
          fakeOccupancyIncomeLevel2 = {
            numOfHousehold: 3
          }
          spyOn(fakeListingEligibilityService, 'occupancyIncomeLevels').and.returnValue([fakeOccupancyIncomeLevel, fakeOccupancyIncomeLevel2])
          spyOn(fakeListingEligibilityService, 'householdAMIChartCutoff').and.returnValue(4)
          expect(ctrl.showAMItoggler()).toEqual true
        it 'returns false when maxNumOfHousehold is < householdAMIChartCutoff', ->
          fakeListingDataService.AMICharts = fakeAMI
          fakeOccupancyIncomeLevel = {
            numOfHousehold: 5
          }
          fakeOccupancyIncomeLevel2 = {
            numOfHousehold: 3
          }
          spyOn(fakeListingEligibilityService, 'occupancyIncomeLevels').and.returnValue([fakeOccupancyIncomeLevel, fakeOccupancyIncomeLevel2])
          spyOn(fakeListingEligibilityService, 'householdAMIChartCutoff').and.returnValue(6)
          expect(ctrl.showAMItoggler()).toEqual false

      describe 'hasMultipleAMICharts', ->
        it 'returns true when there are 2 or more AMI charts', ->
          fakeListingDataService.AMICharts = [1,2]
          expect(ctrl.hasMultipleAMICharts()).toEqual true
        it 'returns false when there is 1 or fewer AMI charts', ->
          fakeListingDataService.AMICharts = [1]
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
        it 'calls ListingPreferenceService.getListingPreferences', ->
          ctrl.getListingPreferences()
          expect(fakeListingPreferenceService.getListingPreferences).toHaveBeenCalledWith(fakeListingDataService.listing)

      describe 'listingHasPriorityUnits', ->
        it "calls ListingUnitService.listingHasPriorityUnits with the parent's listing", ->
          ctrl.listingHasPriorityUnits()
          expect(fakeListingUnitService.listingHasPriorityUnits).toHaveBeenCalledWith(fakeListing)

      describe 'priorityLabel', ->
        it 'calls ListingDataService.priorityLabel with the given arguments', ->
          ctrl.priorityLabel(1, 2)
          expect(fakeListingDataService.priorityLabel).toHaveBeenCalledWith(1, 2)

      describe 'occupancyIncomeLevels', ->
        it "calls ListingEligibilityService.occupancyIncomeLevels with the parent's listing and the given amiLevel", ->
          spyOn(fakeListingEligibilityService, 'occupancyIncomeLevels')
          ctrl.occupancyIncomeLevels(1)
          expect(fakeListingEligibilityService.occupancyIncomeLevels).toHaveBeenCalledWith(fakeListing, 1)

      describe 'householdAMIChartCutoff', ->
        it 'calls ListingEligibilityService.householdAMIChartCutoff', ->
          spyOn(fakeListingEligibilityService, 'householdAMIChartCutoff')
          ctrl.householdAMIChartCutoff()
          expect(fakeListingEligibilityService.householdAMIChartCutoff).toHaveBeenCalled()

      describe 'incomeForHouseholdSize', ->
        it 'calls ListingEligibilityService.incomeForHouseholdSize with the given arguments', ->
          ctrl.incomeForHouseholdSize(1, 2)
          expect(fakeListingEligibilityService.incomeForHouseholdSize).toHaveBeenCalledWith(1, 2)
