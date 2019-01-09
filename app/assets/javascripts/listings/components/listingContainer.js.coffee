angular.module('dahlia.components')
.component 'listingContainer',
  transclude: true
  templateUrl: 'listings/components/listing-container.html'
  controller: ['ListingService', 'ListingHelperService', 'SharedService', (ListingService, ListingHelperService, SharedService) ->
    ctrl = @
    # TODO: remove Shared Service once we create a Shared Container
    this.$onInit = ->
      console.log(SharedService.assetPaths)

    @listingEmailAlertUrl = "http://eepurl.com/dkBd2n"
    @assetPaths = SharedService.assetPaths
    @listing = ListingService.listing
    @loading  = ListingService.loading
    @error = ListingService.error
    @toggleStates = ListingService.toggleStates
    @AMICharts = ListingService.AMICharts

    @reservedLabel = ->
      ListingHelperService.reservedLabel(@listing, @listing.Reserved_community_type, 'eligibility')

    @getListingAMI = ->
      ListingService.getListingAMI()

    @listingIsReservedCommunity = () ->
      ListingService.listingIsReservedCommunity(@listing)

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

    @submittedApplication = ->
      @application &&
      @application.id &&
      @application.status.toLowerCase() == 'submitted'

    @hasEligibilityFilters = ->
      ListingService.hasEligibilityFilters()

    return ctrl
  ]
