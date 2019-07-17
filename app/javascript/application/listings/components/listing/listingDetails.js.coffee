angular.module('dahlia.components')
.component 'listingDetails',
  template: require('html-loader!application/listings/components/listing/listing-details.html'
  require:
    parent: '^listingContainer'
