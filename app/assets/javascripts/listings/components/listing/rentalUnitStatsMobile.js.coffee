angular.module('dahlia.components')
.component 'rentalUnitStatsMobile',
  templateUrl: 'listings/components/listing/rental-unit-stats-mobile.html'
  require:
    parent: '^propertyHero'
  bindings:
    groupedUnits: '<'