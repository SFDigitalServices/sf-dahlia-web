angular.module('dahlia.components')
.component 'saleUnitStats',
  templateUrl: 'listings/components/listing/sale-unit-stats.html'
  require:
    parent: '^propertyHero'
  bindings:
    unitGroup: '<'
  controller: () ->
    ctrl = @

    @groupHasUnitsWithParking = (unitGroups) ->
      _.some(unitGroups, 'Price_With_Parking')

    @groupHasUnitsWithoutParking = (unitGroups) ->
      _.some(unitGroups, 'Price_Without_Parking')

    return ctrl
