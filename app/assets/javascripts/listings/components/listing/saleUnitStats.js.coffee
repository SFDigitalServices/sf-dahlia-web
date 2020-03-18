angular.module('dahlia.components')
.component 'saleUnitStats',
  templateUrl: 'listings/components/listing/sale-unit-stats.html'
  require:
    parent: '^propertyHero'
  bindings:
    unitGroup: '<'
  controller: () ->
    ctrl = @

    @priceGroupHasUnitsWithParking = (priceGroup) ->
      priceGroup['Price_With_Parking'] != undefined
    @priceGroupHasUnitsWithoutParking = (priceGroup) ->
      priceGroup['Price_Without_Parking'] != undefined

    return ctrl
