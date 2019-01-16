angular.module('dahlia.components')
.component 'processSection',
  templateUrl: 'listings/components/process-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', (ListingService) ->
    ctrl = @

    @sortedInformationSessions = ->
      ListingService.sortByDate(this.parent.listing.Information_Sessions)

    @sortedOpenHouses = ->
      ListingService.sortByDate(this.parent.listing.Open_Houses)

    return ctrl
  ]