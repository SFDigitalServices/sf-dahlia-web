angular.module('dahlia.components')
.component 'propertyHero',
  templateUrl: 'listings/components/property-hero.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', 'ShortFormApplicationService', '$sce', (ListingService, ShortFormApplicationService, $sce) ->
    ctrl = @

    @application = ShortFormApplicationService.application
    @listingDownloadURLs = ListingService.listingDownloadURLs
    @carouselHeight = null

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
      index = _.findIndex(this.parent.listing.reservedDescriptor, ['name', descriptor])
      @reservedUnitIcons[index]

    @submittedApplication = ->
      @application &&
      @application.id &&
      @application.status.toLowerCase() == 'submitted'

    @showApplicationOptions = false
    @toggleApplicationOptions = () ->
      @showApplicationOptions = !@showApplicationOptions

    return ctrl
  ]
