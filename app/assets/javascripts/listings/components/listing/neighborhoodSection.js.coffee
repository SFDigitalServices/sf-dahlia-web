angular.module('dahlia.components')
.component 'neighborhoodSection',
  templateUrl: 'listings/components/listing/neighborhood-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingDataService', '$sce', (ListingDataService, $sce) ->
    ctrl = @

    @googleMapSrc = (listing) ->
      # exygy google places API key -- should be unlimited use for this API
      api_key = 'AIzaSyCESh0JTN4pyQK4R4N4WnRwfLqQ9CZsSck'
      url = "https://www.google.com/maps/embed/v1/place?key=#{api_key}&q=#{this.parent.formattedBuildingAddress(this.parent.listing)}"
      $sce.trustAsResourceUrl(url)

    return ctrl
  ]
