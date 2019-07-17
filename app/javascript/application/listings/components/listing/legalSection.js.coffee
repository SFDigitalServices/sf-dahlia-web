angular.module('dahlia.components')
.component 'legalSection',
  template: require('html-loader!application/listings/components/listing/legal-section.html')
  require:
    parent: '^listingContainer'

  controller: ['$translate', ($translate) ->
    ctrl = @

    @realtorCommissionMessage = (listing) ->
      if listing.Realtor_Commission_Unit == 'percent'
        $translate.instant("LISTINGS.REALTOR_COMMISSION_PERCENTAGE", percentage: listing.Realtor_Commission_Amount)
      else
        " $#{listing.Realtor_Commission_Amount}"

    return ctrl
  ]
