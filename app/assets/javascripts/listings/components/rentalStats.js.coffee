angular.module('dahlia.components')
.component 'rentalStats',
  templateUrl: 'listings/components/rental-stats.html'
  bindings:
    listing: '<'
  require:
    listingContainer: '^propertyCard'
  controller: () ->
    ctrl = @
    for summary in _.concat(ctrl.listing.unitSummaries.general, ctrl.listing.unitSummaries.reserved)
      if summary
        summary['minIncome'] = 1500
        summary['maxIncome'] = 3500