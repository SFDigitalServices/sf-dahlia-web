angular.module('dahlia.components')
.component 'eligibilitySection',
  templateUrl: 'listings/components/eligibility-section.html'
  require:
    parent: '^listingContainer'
  controller: [
    '$translate', 'ListingDataService', 'ListingPreferencesService', 'ListingUnitService',
    ($translate, ListingDataService, ListingPreferencesService, ListingUnitService) ->
      ctrl = @

      @loading = ListingPreferencesService.loading
      @error = ListingPreferencesService.error

      @occupancy = (unitSummary) ->
        return '1' if unitSummary.maxOccupancy == 1
        unitSummary.minOccupancy + '-' + unitSummary.maxOccupancy

      @occupancyLabel = (maxOccupancy) ->
        return $translate.instant('LISTINGS.PERSON') if maxOccupancy == 1
        $translate.instant('LISTINGS.PEOPLE')

      @showAMItoggler = ->
        return false if _.isEmpty(ListingDataService.AMICharts)
        amiLevel = _.last(ListingDataService.AMICharts)
        lastHouseholdIncomeLevel = ListingDataService.occupancyIncomeLevels(this.parent.listing, amiLevel)
        maxNumOfHousehold = _.max(_.map(lastHouseholdIncomeLevel, 'numOfHousehold'))
        maxNumOfHousehold > ListingDataService.householdAMIChartCutoff()

      @hasMultipleAMICharts = ->
        ListingDataService.AMICharts.length > 1

      @listingHasPreferences = ->
        this.parent.listing.preferences && this.parent.listing.preferences.length > 0

      @listingHasOnlySROUnits = ->
        ListingUnitService.listingHasOnlySROUnits(this.parent.listing)

      @getListingPreferences = ->
        ListingPreferencesService.getListingPreferences(this.parent.listing)

      @listingHasPriorityUnits = ->
        ListingUnitService.listingHasPriorityUnits(this.parent.listing)

      @priorityLabel = (priority, modifier) ->
        ListingDataService.priorityLabel(priority, modifier)

      @occupancyIncomeLevels = (amiLevel) ->
        ListingDataService.occupancyIncomeLevels(this.parent.listing, amiLevel)

      @householdAMIChartCutoff = ->
        ListingDataService.householdAMIChartCutoff()

      @incomeForHouseholdSize = (amiChart, householdIncomeLevel) ->
        ListingDataService.incomeForHouseholdSize(amiChart, householdIncomeLevel)

      return ctrl
  ]
