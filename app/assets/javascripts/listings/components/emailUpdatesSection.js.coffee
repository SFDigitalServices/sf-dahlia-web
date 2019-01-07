angular.module('dahlia.components')
.component 'emailUpdatesSection',
  templateUrl: 'listings/components/email-updates-section.html'
  require:
    parent: '^listingContainer'
  controller: ['ListingService', (ListingService) ->
    ctrl = @

    return ctrl
  ]