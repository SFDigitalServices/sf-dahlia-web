angular.module('dahlia.components')
.component 'eligibilitySection',
  templateUrl: 'listings/components/eligibility-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', 'ListingHelperService', '$translate', (ListingService, ListingHelperService, $translate) ->
    ctrl = @

    @occupancy = (unitSummary) ->
      return '1' if unitSummary.maxOccupancy == 1
      unitSummary.minOccupancy + '-' + unitSummary.maxOccupancy

    @occupancyLabel = (maxOccupancy) ->
      return $translate.instant('LISTINGS.PERSON') if maxOccupancy == 1
      $translate.instant('LISTINGS.PEOPLE')

    @showAMItoggler = ->
      return false if _.isEmpty(ListingService.AMICharts)
      amiLevel = _.last(ListingService.AMICharts)
      lastHouseholdIncomeLevel = ListingService.occupancyIncomeLevels(this.parent.listing, amiLevel)
      maxNumOfHousehold = _.max(_.map(lastHouseholdIncomeLevel, 'numOfHousehold'))
      maxNumOfHousehold > ListingService.householdAMIChartCutoff()

    @hasMultipleAMICharts = ->
      ListingService.AMICharts.length > 1

    @listingHasPreferences = ->
      this.parent.listing.preferences && this.parent.listing.preferences.length

    @listingHasOnlySROUnits = ->
      ListingService.listingHasOnlySROUnits(this.parent.listing)

    @getListingPreferences = ->
      ListingService.getListingPreferences()

    @listingHasPriorityUnits = ->
      ListingService.listingHasPriorityUnits(this.parent.listing)

    @priorityLabel = (priority, modifier) ->
      ListingHelperService.priorityLabel(priority, modifier)

    @occupancyIncomeLevels = (amiLevel) ->
      ListingService.occupancyIncomeLevels(this.parent.listing, amiLevel)

    @householdAMIChartCutoff = ->
      ListingService.householdAMIChartCutoff()

    return ctrl
  ]
