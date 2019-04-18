angular.module('dahlia.components')
.component 'lotteryPreference',
  bindings:
    preference: '<'
    listing: '<'
  templateUrl: 'listings/components/listing/lottery-preference.html'

  controller: ['ListingDataService', 'ListingIdentityService', (ListingDataService, ListingIdentityService) ->
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
      if ListingIdentityService.isSale(@listing)
        'homebuyers'
      else
        docSectionMap[@preference.preferenceName]

    return ctrl
  ]
