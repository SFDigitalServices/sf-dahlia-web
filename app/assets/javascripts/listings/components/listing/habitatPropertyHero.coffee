angular.module('dahlia.components')
.component 'habitatPropertyHero',
  templateUrl: 'listings/components/listing/habitat-property-hero.html'
  require:
    parent: '^propertyHero'
  bindings:
    unitGroups: '<'
  controller: ['$filter', '$translate', ($filter, $translate) ->
    ctrl = @
    @translatedIncomeRanges = () ->
      return [] if !ctrl.unitGroups
      translated = ctrl.unitGroups.map((range) ->
        if range.occupancy == 1
          $translate.instant(
            'listings.habitat.income_range.income_range_singular', {
              'number': range.occupancy,
              'minIncome': $filter('currency')(range.minIncome, '$', 0)
              'maxIncome': $filter('currency')(range.maxIncome, '$', 0)
            }
          )
        else
          $translate.instant(
            'listings.habitat.income_range.income_range_plural',
            {
              'number': range.occupancy,
              'minIncome': $filter('currency')(range.minIncome, '$', 0)
              'maxIncome': $filter('currency')(range.maxIncome, '$', 0)
            }
          )
      )
      return translated

    return ctrl
  ]
