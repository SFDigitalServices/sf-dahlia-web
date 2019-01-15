angular.module('dahlia.components')
.component 'listingDetails',
  templateUrl: 'listings/components/listing-details.html'
  require:
    parent: '^listingContainer'

