angular.module('dahlia.components')
.component 'listingContainer',
  transclude: true
  templateUrl: 'listings/components/listing-container.html'
  controller: ['ListingDataService', 'ListingEligibilityService', 'ListingIdentityService', 'ListingUnitService', 'SharedService',
  (ListingDataService, ListingEligibilityService, ListingIdentityService, ListingUnitService, SharedService) ->
    ctrl = @
    # TODO: remove Shared Service once we create a Shared Container
    @listingEmailAlertUrl = "http://eepurl.com/dkBd2n"
    @assetPaths = SharedService.assetPaths
    @listing = ListingDataService.listing
    @listings = ListingDataService.listings
    @loading  = ListingDataService.loading
    @error = ListingDataService.error
    @toggleStates = ListingDataService.toggleStates
    @AMICharts = ListingDataService.AMICharts
    @favorites = ListingDataService.favorites

    @openListings = ListingDataService.openListings
    @openMatchListings = ListingDataService.openMatchListings
    @openNotMatchListings = ListingDataService.openNotMatchListings
    @closedListings = ListingDataService.closedListings
    @lotteryResultsListings = ListingDataService.lotteryResultsListings

    @isOwnershipListing = (listing) ->
      @listing.Tenure == 'New sale' || @listing.Tenure == 'Resale'

    @isOpenMatchListing = (listing) ->
      @openMatchListings.indexOf(listing) > -1

    @isFavorited = (listingId) ->
      ListingDataService.isFavorited(listingId)

    @reservedLabel = (listing, type, modifier) ->
      ListingDataService.reservedLabel(listing, type, modifier)

    @getListingAMI =(listing) ->
      ListingDataService.getListingAMI(listing)

    @listingIsReservedCommunity = (listing) ->
      !! listing.Reserved_community_type

    @listingIs = (name, listing) ->
      ListingIdentityService.listingIs(name, listing)

    @listingHasReservedUnits = (listing) ->
      ListingUnitService.listingHasReservedUnits(listing)

    @isFirstComeFirstServe = (listing) ->
      ListingIdentityService.isFirstComeFirstServe(listing)

    @listingApplicationClosed = (listing) ->
      !ListingIdentityService.isOpen(listing)

    @formattedBuildingAddress = (listing, display) ->
      ListingDataService.formattedAddress(listing, 'Building', display)

    @formattedLeasingAgentAddress = (listing) ->
      ListingDataService.formattedAddress(listing, 'Leasing_Agent')

    @toggleFavoriteListing = (listingId) ->
      ListingDataService.toggleFavoriteListing(listingId)

    @isFavorited = (listingId) ->
      ListingDataService.isFavorited(listingId)

    @getListingUnits = (listing) ->
      ListingUnitService.getListingUnits(listing)

    @listingHasSROUnits = (listing) ->
      ListingUnitService.listingHasSROUnits(listing)

    @hasEligibilityFilters = ->
      ListingEligibilityService.hasEligibilityFilters()

    @lotteryDateVenueAvailable = (listing) ->
      (listing.Lottery_Date != undefined &&
        listing.Lottery_Venue != undefined && listing.Lottery_Street_Address != undefined)

    return ctrl
  ]
