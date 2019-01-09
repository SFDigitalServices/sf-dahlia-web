angular.module('dahlia.components')
.component 'propertyHero',
  templateUrl: 'listings/components/property-hero.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', '$sce', '$timeout', '$window', (ListingService, $sce, $timeout, $window) ->
    ctrl = @

    this.$postLink = ->
      @setupCarouselHeight()

    # TODO: debug this is from directive adjustCarouselHeight -- looks different still from https://dahlia-full.herokuapp.com/listings/a0W0P00000F7GabUAF
    @setupCarouselHeight = ->
      angular.element(document).find('img')[0].offsetHeight
      angular.element($window).bind 'resize', ->
        console.log('resizing')
        $timeout ->
          propertyImage = angular.element(document).find('img')[0]
          @carouselHeight = propertyImage.offsetHeight
        , 0, false

    @carouselHeight = 300

    @reservedUnitIcons = [
      $sce.trustAsResourceUrl('#i-star')
      $sce.trustAsResourceUrl('#i-cross')
      $sce.trustAsResourceUrl('#i-oval')
      $sce.trustAsResourceUrl('#i-polygon')
    ]


    @listingImages = (listing) ->
      # TODO: update when we are getting multiple images from Salesforce
      # right now it's just an array of one
      [listing.imageURL]

    @hasMultipleAMIUnits = ->
      _.keys(this.parent.listing.groupedUnits).length > 1

    @reservedDescriptorIcon = (listing, descriptor) ->
      index = _.findIndex(listing.reservedDescriptor, ['name', descriptor])
      @reservedUnitIcons[index]

    return ctrl
  ]
