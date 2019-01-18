angular.module('dahlia.components')
.component 'listingContainer',
  transclude: true
  templateUrl: 'listings/components/listing-container.html'
  controller: ['ListingService', 'ListingHelperService', 'SharedService', 'ListingEligibilityService',
  (ListingService, ListingHelperService, SharedService, ListingEligibilityService) ->
    ctrl = @
    # TODO: remove Shared Service once we create a Shared Container
    @listingEmailAlertUrl = "http://eepurl.com/dkBd2n"
    @assetPaths = SharedService.assetPaths
    @listing = ListingService.listing
    @listings = ListingService.listings
    @loading  = ListingService.loading
    @error = ListingService.error
    @toggleStates = ListingService.toggleStates
    @AMICharts = ListingService.AMICharts
    @favorites = ListingService.favorites

    @openListings = ListingService.openListings
    @openMatchListings = ListingService.openMatchListings
    @openNotMatchListings = ListingService.openNotMatchListings
    @closedListings = ListingService.closedListings
    @lotteryResultsListings = ListingService.lotteryResultsListings

    @isOpenMatchListing = (listing) ->
      @openMatchListings.indexOf(listing) > -1

    @isFavorited = (listing_id) ->
      ListingService.isFavorited(listing_id)

    @reservedLabel = (type, modifier, listing = null) ->
      type = @listing.Reserved_community_type unless type
      listing = @listing unless listing
      ListingHelperService.reservedLabel(listing, type, modifier)

    @getListingAMI = ->
      ListingService.getListingAMI()

    @listingIsReservedCommunity = (listing = null) ->
      listing = @listing unless listing
      ListingService.listingIsReservedCommunity(listing)

    @listingIs = (name) ->
      ListingService.listingIs(name)

    @listingHasReservedUnits = ->
      ListingService.listingHasReservedUnits(@listing)

    @listingIsFirstComeFirstServe = (listing = @listing) ->
      ListingService.listingIsFirstComeFirstServe(listing)

    @listingApplicationClosed = (listing) ->
      !ListingService.listingIsOpen(listing)

    @formattedBuildingAddress = (listing, display) ->
      ListingHelperService.formattedAddress(listing, 'Building', display)

    @formattedLeasingAgentAddress = (listing) ->
      ListingHelperService.formattedAddress(listing, 'Leasing_Agent')

    @toggleFavoriteListing = (listing_id) ->
      ListingService.toggleFavoriteListing(listing_id)

    @isFavorited = (listing_id) ->
      ListingService.isFavorited(listing_id)

    @getListingUnits = ->
      ListingService.getListingUnits()

    @listingHasSROUnits = ->
      ListingService.listingHasSROUnits(@listing)

    @hasEligibilityFilters = ->
      ListingEligibilityService.hasEligibilityFilters()

    @lotteryDateVenueAvailable = (listing) ->
      (listing.Lottery_Date != undefined &&
        listing.Lottery_Venue != undefined && listing.Lottery_Street_Address != undefined)

    return ctrl
  ]
