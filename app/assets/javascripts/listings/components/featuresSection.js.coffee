angular.module('dahlia.components')
.component 'featuresSection',
  templateUrl: 'listings/components/features-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', 'ListingHelperService', '$translate', (ListingService, ListingHelperService, $translate) ->
    ctrl = @

    @toggleTable = (table) ->
      ListingService.toggleStates[this.parent.listing.Id][table] = !ListingService.toggleStates[this.parent.listing.Id][table]

    @formatBaths = (numberOfBathrooms) ->
      return 'Shared' if numberOfBathrooms == 0
      return '1/2 ' + $translate.instant('LISTINGS.BATH') if numberOfBathrooms == 0.5

      fullBaths = Math.floor numberOfBathrooms
      andAHalf = numberOfBathrooms - fullBaths == 0.5

      if andAHalf
        fullBaths + ' 1/2 ' + $translate.instant('LISTINGS.BATH')
      else
        numberOfBathrooms

    @listingIsBMR = ->
      ListingHelperService.isBMR(this.parent.listing)

    return ctrl
  ]
