angular.module('dahlia.components')
.component 'propertyHero',
  templateUrl: 'listings/components/property-hero.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', '$sce', '$timeout', '$window', (ListingService, $sce, $timeout, $window) ->
    ctrl = @

    this.$postLink = ->
      # @setupCarouselHeight()

    @adjustCarouselHeight = (elem) ->
      $timeout ->
        ctrl.carouselHeight = elem[0].offsetHeight
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
