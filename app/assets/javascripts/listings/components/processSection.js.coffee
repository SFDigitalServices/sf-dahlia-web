angular.module('dahlia.components')
.component 'processSection',
  templateUrl: 'listings/components/process-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingDataService', (ListingDataService) ->
    ctrl = @

    @sortedInformationSessions = ->
      ListingDataService.sortByDate(this.parent.listing.Information_Sessions)

    @sortedOpenHouses = ->
      ListingDataService.sortByDate(this.parent.listing.Open_Houses)

    return ctrl
  ]
