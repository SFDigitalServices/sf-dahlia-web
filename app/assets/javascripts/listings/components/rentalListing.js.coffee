angular.module('dahlia.components')
.component 'rentalListing',
  templateUrl: 'listings/components/rental-listing.html'
  require:
    parent: '^listingContainer'

