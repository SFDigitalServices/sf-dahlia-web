angular.module('dahlia.components')
.component 'rentalStats',
  template: require('html-loader!application/listings/components/rental-stats.html')
  bindings:
    listing: '<'
  require:
    listingContainer: '^propertyCard'