angular.module('dahlia.components')
.component 'listingContainer',
  templateUrl: 'listings/components/listing-container.html'
  controller: ['ListingService', 'ListingHelperService', (ListingService, ListingHelperService) ->
    ctrl = @
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

    return ctrl
  ]
