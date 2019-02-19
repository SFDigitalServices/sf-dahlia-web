angular.module('dahlia.components')
.component 'propertyCard',
  templateUrl: 'listings/components/property-card.html'
  bindings:
    listing: '<'
  require:
    listingContainer: '^listingContainer'
  controller: [
    'ListingDataService', 'SharedService', '$state',
    (ListingDataService, SharedService, $state) ->
      ctrl = @

      @showSharing = ->
        SharedService.showSharing()

      @showMatches = ->
        $state.current.name == 'dahlia.listings-for-rent' && this.listingContainer.hasEligibilityFilters()

      @isOpenNotMatchListing = (listing) ->
        this.listingContainer.openNotMatchListings.indexOf(listing) > -1

      @isOpenListing = (listing) ->
        this.listingContainer.openListings.indexOf(listing) > -1

      @isClosedListing = (listing) ->
        this.listingContainer.closedListings.indexOf(listing) > -1

      @isLotteryResultsListing = (listing) ->
        this.listingContainer.lotteryResultsListings.indexOf(listing) > -1

      @priorityTypes = (listing) ->
        ListingDataService.priorityTypes(listing)

      @priorityTypeNames = (listing) ->
        names = _.map @priorityTypes(listing), (priority) ->
          ListingDataService.priorityLabel(priority, 'name')
        names.join(', ')

      @reservedForLabels = (listing) ->
        types = []
        _.each listing.reservedDescriptor, (descriptor) ->
          if descriptor.name
            type = descriptor.name
            types.push(ListingDataService.reservedLabel(listing, type, 'reservedForWhoAre'))
        if types.length then types.join(' or ') else ''

      @hasSaleUnitsWithoutParking = (listing) ->
        for unitSummary in (listing.unitSummaries.general || []).concat(listing.unitSummaries.reserved || [])
          if unitSummary.minPriceWithoutParking
            return true
        false

      @hasSaleUnitsWithParking = (listing) ->
        for unitSummary in (listing.unitSummaries.general || []).concat(listing.unitSummaries.reserved || [])
          if unitSummary.minPriceWithParking
            return true
        false

      @hasRangeOfPrices = (unitSummary, withParking) ->
        if withParking
          unitSummary.maxPriceWithParking > unitSummary.minPriceWithParking
        else
          unitSummary.maxPriceWithoutParking > unitSummary.minPriceWithoutParking

      return ctrl
  ]
