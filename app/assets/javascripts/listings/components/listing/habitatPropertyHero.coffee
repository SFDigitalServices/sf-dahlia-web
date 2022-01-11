angular.module('dahlia.components')
.component 'habitatPropertyHero',
  templateUrl: 'listings/components/listing/habitat-property-hero.html'
  require:
    parent: '^propertyHero'
  controller: () ->
    ctrl = @
    @something = () ->
      true
    return ctrl
