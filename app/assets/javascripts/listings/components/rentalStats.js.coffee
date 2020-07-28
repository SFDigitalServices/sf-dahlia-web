angular.module('dahlia.components')
.component 'rentalStats',
  templateUrl: 'listings/components/rental-stats.html'
  bindings:
    listing: '<'
  require:
    listingContainer: '^propertyCard'
  controller: ['$translate', ($translate) ->
    ctrl = @
    for summary in _.concat(ctrl.listing.unitSummaries.general, ctrl.listing.unitSummaries.reserved)
      if summary
        summary['minIncome'] = 1500
        summary['maxIncome'] = 3500

    @availabilityText = (unitSummary) ->
      console.log("HREREREREEREHR" + unitSummary)
      if unitSummary.availability > 0
        return "#{unitSummary.availability} #{$translate.instant('listings.stats.available')}"
      else
        return $translate.instant('listings.stats.waitlist')
  ]