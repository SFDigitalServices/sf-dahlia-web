angular.module('dahlia.components')
.component 'saleUnitStats',
  templateUrl: 'listings/components/listing/sale-unit-stats.html'
  require:
    parent: '^propertyHero'
  bindings:
    unitGroups: '<'
  controller: () ->
    ctrl = @

    @groupHasUnitsWithParking = (unitGroups) ->
      for group in unitGroups
        if group.Price_With_Parking
          return true
      false

    @groupHasUnitsWithoutParking = (unitGroups) ->
      for group in unitGroups
        if group.Price_Without_Parking
          return true
      false

    return ctrl
