angular.module('dahlia.components')
.component 'rentalStats',
  templateUrl: 'listings/components/rental-stats.html'
  bindings:
    listing: '<'
  require:
    listingContainer: '^propertyCard'