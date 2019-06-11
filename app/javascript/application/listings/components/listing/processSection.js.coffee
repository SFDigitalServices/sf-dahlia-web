angular.module('dahlia.components')
.component 'processSection',
  templateUrl: 'listings/components/listing/process-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingDataService', (ListingDataService) ->
    ctrl = @

    @sortedInformationSessions = ->
      ListingDataService.sortByDate(this.parent.listing.Information_Sessions)

    return ctrl
  ]
