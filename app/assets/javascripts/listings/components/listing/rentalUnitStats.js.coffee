angular.module('dahlia.components')
.component 'rentalUnitStats',
  templateUrl: 'listings/components/listing/rental-unit-stats.html'
  require:
    parent: '^propertyHero'
  bindings:
    groupedUnits: '<'