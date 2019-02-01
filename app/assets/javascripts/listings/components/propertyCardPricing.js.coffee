angular.module('dahlia.components')
.component 'propertyCardPricing',
  templateUrl: 'listings/components/property-card-pricing.html'
  bindings:
    listing: '<'
  require:
    listingContainer: '^listingContainer'
  controller: [
    'ListingDataService', 'SharedService', '$state',
    (ListingDataService, SharedService, $state) ->
      ctrl = @

      @reservedForLabels = (listing) ->
        types = []
        _.each listing.reservedDescriptor, (descriptor) ->
          if descriptor.name
            type = descriptor.name
            types.push(ListingDataService.reservedLabel(listing, type, 'reservedForWhoAre'))
        if types.length then types.join(' or ') else ''

      return ctrl
  ]
