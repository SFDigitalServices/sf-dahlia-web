angular.module('dahlia.components')
.component 'neighborhoodSection',
  templateUrl: 'listings/components/neighborhood-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingDataService', '$sce', (ListingDataService, $sce) ->
    ctrl = @

    @googleMapSrc = (listing) ->
      # exygy google places API key -- should be unlimited use for this API
      api_key = 'AIzaSyCW_oXspwGsSlthw-MrPxjNvdH56El1pjM'
      url = "https://www.google.com/maps/embed/v1/place?key=#{api_key}&q=#{this.parent.formattedBuildingAddress(this.parent.listing)}"
      $sce.trustAsResourceUrl(url)

    return ctrl
  ]
