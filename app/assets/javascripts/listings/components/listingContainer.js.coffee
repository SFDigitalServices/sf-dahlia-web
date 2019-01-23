angular.module('dahlia.components')
.component 'listingContainer',
  transclude: true
  templateUrl: 'listings/components/listing-container.html'
  controller: ['ListingDataService', 'ListingEligibilityService', 'ListingHelperService', 'ListingUnitService', 'SharedService',
  (ListingDataService, ListingEligibilityService, ListingHelperService, ListingUnitService, SharedService) ->
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

    @isOpenMatchListing = (listing) ->
      @openMatchListings.indexOf(listing) > -1

    @isFavorited = (listing_id) ->
      ListingDataService.isFavorited(listing_id)

    @reservedLabel = (type, modifier, listing = null) ->
      type = @listing.Reserved_community_type unless type
      listing = @listing unless listing
      ListingDataService.reservedLabel(listing, type, modifier)

    @getListingAMI = ->
      ListingDataService.getListingAMI()

    @listingIsReservedCommunity = (listing = @listing) ->
      ListingHelperService.isReservedCommunity(listing)

    @listingIs = (name, listing) ->
      ListingHelperService.listingIs(name, listing)

    @listingHasReservedUnits = ->
      ListingUnitService.listingHasReservedUnits(@listing)

    @isFirstComeFirstServe = (listing = @listing) ->
      ListingHelperService.isFirstComeFirstServe(listing)

    @listingApplicationClosed = (listing) ->
      !ListingHelperService.isOpen(listing)

    @formattedBuildingAddress = (listing, display) ->
      ListingDataService.formattedAddress(listing, 'Building', display)

    @formattedLeasingAgentAddress = (listing) ->
      ListingDataService.formattedAddress(listing, 'Leasing_Agent')

    @toggleFavoriteListing = (listing_id) ->
      ListingDataService.toggleFavoriteListing(listing_id)

    @isFavorited = (listing_id) ->
      ListingDataService.isFavorited(listing_id)

    @getListingUnits = ->
      ListingUnitService.getListingUnits()

    @listingHasSROUnits = ->
      ListingUnitService.listingHasSROUnits(@listing)

    @hasEligibilityFilters = ->
      ListingEligibilityService.hasEligibilityFilters()

    @lotteryDateVenueAvailable = (listing) ->
      (listing.Lottery_Date != undefined &&
        listing.Lottery_Venue != undefined && listing.Lottery_Street_Address != undefined)

    return ctrl
  ]
