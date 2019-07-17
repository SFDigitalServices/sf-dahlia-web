angular.module('dahlia.components')
.component 'featuresSection',
  template: require('html-loader!application/listings/components/listing/features-section.html')
  require:
    parent: '^listingContainer'
  controller: ['ListingDataService', '$translate', (ListingDataService, $translate) ->
    ctrl = @

    @toggleTable = (table) ->
      ListingDataService.toggleStates[this.parent.listing.Id][table] = !ListingDataService.toggleStates[this.parent.listing.Id][table]

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
      ['IH-RENTAL', 'IH-OWN'].indexOf(this.parent.listing.Program_Type) >= 0

    return ctrl
  ]
