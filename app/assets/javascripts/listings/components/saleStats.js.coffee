angular.module('dahlia.components')
.component 'saleStats',
  templateUrl: 'listings/components/sale-stats.html'
  bindings:
    listing: '<'
  require:
    listingContainer: '^propertyCard'
  controller: () ->
      ctrl = @

      @hasUnitsWithoutParking = (listing) ->
        for unitSummary in (listing.unitSummaries.general || []).concat(listing.unitSummaries.reserved || [])
          if unitSummary.minPriceWithoutParking
            return true
        false

      @hasUnitsWithParking = (listing) ->
        for unitSummary in (listing.unitSummaries.general || []).concat(listing.unitSummaries.reserved || [])
          if unitSummary.minPriceWithParking
            return true
        false

      @hasRangeOfPricesWithoutParking = (unitSummary) ->
        unitSummary.maxPriceWithoutParking > unitSummary.minPriceWithoutParking

      @hasRangeOfPricesWithParking = (unitSummary) ->
        unitSummary.maxPriceWithParking > unitSummary.minPriceWithParking

      return ctrl
