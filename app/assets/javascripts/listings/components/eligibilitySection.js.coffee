angular.module('dahlia.components')
.component 'eligibilitySection',
  templateUrl: 'listings/components/eligibility-section.html'
  require:
    parent: '^listingContainer'
  controller: [
    '$translate', 'ListingDataService', 'ListingEligibilityService', 'ListingPreferenceService', 'ListingUnitService',
    ($translate, ListingDataService, ListingEligibilityService, ListingPreferenceService, ListingUnitService) ->
      ctrl = @

      @loading = ListingPreferenceService.loading
      @error = ListingPreferenceService.error

      @occupancy = (unitSummary) ->
        if unitSummary.maxOccupancy == 1
          "1"
        else if unitSummary.maxOccupancy == null
          "at least #{unitSummary.minOccupancy}"
        else
          "#{unitSummary.minOccupancy}-#{unitSummary.maxOccupancy}"

      @occupancyLabel = (numberOfPeople) ->
        return $translate.instant('LISTINGS.PERSON') if numberOfPeople == 1
        $translate.instant('LISTINGS.PEOPLE')

      @showAMItoggler = ->
        return false if _.isEmpty(ListingDataService.AMICharts)
        amiLevel = _.last(ListingDataService.AMICharts)
        lastHouseholdIncomeLevel = ListingEligibilityService.occupancyIncomeLevels(this.parent.listing, amiLevel)
        maxNumOfHousehold = _.max(_.map(lastHouseholdIncomeLevel, 'numOfHousehold'))
        maxNumOfHousehold > ListingEligibilityService.householdAMIChartCutoff(this.parent.listing)

      @hasMultipleAMICharts = ->
        ListingDataService.AMICharts.length > 1

      @listingHasPreferences = ->
        this.parent.listing.preferences && this.parent.listing.preferences.length > 0

      @listingHasOnlySROUnits = ->
        ListingUnitService.listingHasOnlySROUnits(this.parent.listing)

      @getListingPreferences = ->
        ListingPreferenceService.getListingPreferences(this.parent.listing)

      @listingHasPriorityUnits = ->
        ListingUnitService.listingHasPriorityUnits(this.parent.listing)

      @priorityLabel = (priority, modifier) ->
        ListingDataService.priorityLabel(priority, modifier)

      @occupancyIncomeLevels = (amiLevel) ->
        ListingEligibilityService.occupancyIncomeLevels(this.parent.listing, amiLevel)

      @householdAMIChartCutoff = ->
        ListingEligibilityService.householdAMIChartCutoff(this.parent.listing)

      @incomeForHouseholdSize = (amiChart, householdIncomeLevel) ->
        ListingEligibilityService.incomeForHouseholdSize(amiChart, householdIncomeLevel)

      return ctrl
  ]
