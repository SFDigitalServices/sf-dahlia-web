angular.module('dahlia.components')
.component 'rentalUnitStats',
  template: require('html-loader!application/listings/components/listing/rental-unit-stats.html')
  require:
    parent: '^propertyHero'
  bindings:
    unitGroups: '<'