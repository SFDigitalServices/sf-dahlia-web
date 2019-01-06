angular.module('dahlia.components')
.component 'listingContainer',
  transclude: true
  templateUrl: 'listings/components/listing-container.html'
  controller: ['ListingService', 'ListingHelperService', 'SharedService', (ListingService, ListingHelperService, SharedService) ->
    ctrl = @
    # To do: remove Shared Service once we create a Shared
    this.$onInit = ->
      console.log(SharedService.assetPaths)

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

    @listingIsFirstComeFirstServe = (listing = @listing) ->
      ListingService.listingIsFirstComeFirstServe(listing)

    @listingHasReservedUnits = ->
      ListingService.listingHasReservedUnits(@listing)

    @listingIsFirstComeFirstServe = (listing = @listing) ->
      ListingService.listingIsFirstComeFirstServe(listing)

    @listingApplicationClosed = (listing) ->
      console.log('here')
      !ListingService.listingIsOpen(listing)

    @formattedBuildingAddress = (listing, display) ->
        ListingHelperService.formattedAddress(listing, 'Building', display)

    return ctrl
  ]
