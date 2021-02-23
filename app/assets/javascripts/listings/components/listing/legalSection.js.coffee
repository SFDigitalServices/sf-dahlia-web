angular.module('dahlia.components')
.component 'legalSection',
  templateUrl: 'listings/components/listing/legal-section.html'
  require:
    parent: '^listingContainer'

  controller: ['$translate', ($translate) ->
    ctrl = @

    @realtorCommissionMessage = (listing) ->
      if listing.Realtor_Commission_Unit == 'percent'
        $translate.instant("listings.realtor_commission_percentage", percentage: listing.Realtor_Commission_Amount)
      else
        " $#{listing.Realtor_Commission_Amount}"

    return ctrl
  ]
