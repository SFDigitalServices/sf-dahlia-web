angular.module('dahlia.components')
.component 'openHoursSection',
  templateUrl: 'listings/components/listing/open-hours-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingDataService', (ListingDataService) ->
    ctrl = @

    @sortedOpenHouses = ->
      ListingDataService.sortByDate(this.parent.listing.Open_Houses)

    return ctrl
  ]
