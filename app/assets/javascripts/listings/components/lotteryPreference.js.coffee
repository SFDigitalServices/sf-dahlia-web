angular.module('dahlia.components')
.component 'lotteryPreference',
  bindings:
    preference: '<'
  templateUrl: 'listings/components/lottery-preference.html'

  controller: ['ListingService', (ListingService) ->
    ctrl = @

    docSectionMap =
      "Live or Work in San Francisco Preference": 'resident'
      "Neighborhood Resident Housing Preference (NRHP)": 'resident'
      "Anti-Displacement Housing Preference (ADHP)": 'resident'
      "Rent Burdened / Assisted Housing Preference": 'assisted-housing'
      # harcoded for now
      "Alice Griffith Housing Development Resident": 'alice-griffith'

    @isPrefWithProof = ->
      _.has(docSectionMap, @preference.preferenceName)

    @docSection = ->
      docSectionMap[@preference.preferenceName]

    return ctrl
  ]
