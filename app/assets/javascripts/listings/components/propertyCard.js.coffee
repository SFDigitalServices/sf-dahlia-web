angular.module('dahlia.components')
.component 'propertyCard',
  templateUrl: 'listings/components/property-card.html'
  bindings:
    listing: '<'
  require:
    browseListings: '^browseListings'
    listingContainer: '^listingContainer'
  controller: ['ListingService', 'ListingHelperService', 'SharedService', '$state', (ListingService, ListingHelperService, SharedService, $state) ->
    ctrl = @

    this.$onInit = ->
      console.log(SharedService.assetPaths)



    @showSharing = ->
      SharedService.showSharing()

    @showMatches = ->
      $state.current.name == 'dahlia.listings' && this.listingContainer.hasEligibilityFilters()

    @isOpenNotMatchListing = (listing) ->
      this.browseListings.openNotMatchListings.indexOf(listing) > -1

    @isOpenListing = (listing) ->
      this.browseListings.openListings.indexOf(listing) > -1

    @isClosedListing = (listing) ->
      this.browseListings.closedListings.indexOf(listing) > -1

    @isLotteryResultsListing = (listing) ->
      this.browseListings.lotteryResultsListings.indexOf(listing) > -1

    @priorityTypes = (listing) ->
      ListingService.priorityTypes(listing)

    @priorityTypeNames = (listing) ->
      names = _.map @priorityTypes(listing), (priority) ->
        ListingHelperService.priorityLabel(priority, 'name')
      names.join(', ')

    @reservedForLabels = (listing) ->
      types = []
      _.each listing.reservedDescriptor, (descriptor) ->
        if descriptor.name
          type = descriptor.name
          types.push(ListingHelperService.reservedLabel(listing, type, 'reservedForWhoAre'))
      if types.length then types.join(' or ') else ''


    return ctrl
  ]
