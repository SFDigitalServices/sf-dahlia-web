angular.module('dahlia.components')
.component 'legalSection',
  templateUrl: 'listings/components/legal-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', (ListingService) ->
    ctrl = @

    return ctrl
  ]