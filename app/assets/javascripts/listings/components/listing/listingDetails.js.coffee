angular.module('dahlia.components')
.component 'listingDetails',
  templateUrl: 'listings/components/listing/listing-details.html'
  require:
    parent: '^listingContainer'
  controller: ['$translate',
  ($translate) ->
    ctrl = @

    @eligibilitySubheader = (listing) ->
      if( !this.parent.isSale(listing) )
        $translate.instant('listings.eligibility.subheader')

    @altLogoText = ->
      $translate.instant('listings.equal_housing_opportunity_logo')

    return ctrl
  ]