angular.module('dahlia.components')
.component 'lotteryPreference',
  bindings:
    preference: '<'
    listing: '<'
  template: require('html-loader!application/listings/components/listing/lottery-preference.html')

  controller: ['ListingDataService', (ListingDataService) ->
    ctrl = @

    docSectionMap = {
      "Live or Work in San Francisco Preference": 'resident'
      "Neighborhood Resident Housing Preference (NRHP)": 'resident'
      "Anti-Displacement Housing Preference (ADHP)": 'resident'
      "Rent Burdened / Assisted Housing Preference": 'assisted-housing'
      "Alice Griffith Housing Development Resident": 'alice-griffith'
    }

    @isPrefWithProof = ->
      _.has(docSectionMap, @preference.preferenceName)

    @docSection = ->
      docSectionMap[@preference.preferenceName]

    return ctrl
  ]
