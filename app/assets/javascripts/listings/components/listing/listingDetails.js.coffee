angular.module('dahlia.components')
.component 'listingDetails',
  templateUrl: 'listings/components/listing/listing-details.html'
  require:
    parent: '^listingContainer'
