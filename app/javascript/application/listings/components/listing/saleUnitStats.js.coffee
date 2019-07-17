angular.module('dahlia.components')
.component 'saleUnitStats',
  template: require('html-loader!application/listings/components/listing/sale-unit-stats.html')
  require:
    parent: '^propertyHero'
  bindings:
    unitGroups: '<'
  controller: () ->
    ctrl = @

    @groupHasUnitsWithParking = (unitGroups) ->
      _.some(unitGroups, 'Price_With_Parking')

    @groupHasUnitsWithoutParking = (unitGroups) ->
      _.some(unitGroups, 'Price_Without_Parking')

    return ctrl
