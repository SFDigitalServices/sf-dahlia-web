angular.module('dahlia.components')
.component 'eligibilitySection',
  templateUrl: 'listings/components/listing/eligibility-section.html'
  require:
    parent: '^listingContainer'
  controller: [
    '$filter', '$translate', 'ListingDataService', 'ListingEligibilityService', 'ListingPreferenceService', 'ListingUnitService',
    ($filter, $translate, ListingDataService, ListingEligibilityService, ListingPreferenceService, ListingUnitService) ->
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
        return $translate.instant('listings.person') if numberOfPeople == 1
        $translate.instant('listings.people')

      @showAMItoggler = ->
        return false if _.isEmpty(ListingUnitService.AMICharts)
        minMax = ListingEligibilityService.householdMinMaxForMaxIncomeTable(this.parent.listing, ListingUnitService.AMICharts)
        minMax.max > ListingEligibilityService.householdAMIChartCutoff(this.parent.listing)

      @hasMultipleAMICharts = ->
        ListingUnitService.AMICharts.length > 1

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

      @occupancyIncomeLevels = (amiCharts) ->
        ListingEligibilityService.occupancyIncomeLevels(this.parent.listing, amiCharts)

      @hhSizesToShowInMaxIncomeTable = (amiCharts) ->
        ListingEligibilityService.hhSizesToShowInMaxIncomeTable(this.parent.listing, amiCharts)

      @householdAMIChartCutoff = ->
        ListingEligibilityService.householdAMIChartCutoff(this.parent.listing)

      @getMultiAmiIncomeString = (amiChart, numOfHousehold) ->
        income = ListingEligibilityService.incomeForHouseholdSize(amiChart, numOfHousehold)
        if income
          @formatIncomePerYear income

      @formatIncomePerYear = (income) ->
        $filter('currency')(income, '$', 0) + ' ' + $translate.instant('label.per_year')

      @formatIncomePerMonth = (income) ->
        per_month = $filter('divideAndRoundDown')(income, 12)
        $filter('currency')(per_month, '$', 0) + ' ' + $translate.instant('label.per_month')

      return ctrl
  ]
