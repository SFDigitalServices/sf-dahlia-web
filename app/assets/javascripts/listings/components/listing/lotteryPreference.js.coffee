angular.module('dahlia.components')
.component 'lotteryPreference',
  bindings:
    preference: '<'
    listing: '<'
  templateUrl: 'listings/components/listing/lottery-preference.html'

  controller: ['ListingDataService', (ListingDataService) ->
    ctrl = @

    prefMap = ListingDataService.preferenceMap
    docSectionMap = {
      "#{prefMap['liveWorkInSf']}": 'resident',
      "#{prefMap['neighborhoodResidence']}": 'resident',
      "#{prefMap['antiDisplacement']}": 'resident',
      "#{prefMap['assistedHousing']}": 'assisted-housing',
      "#{prefMap['aliceGriffith']}": 'alice-griffith',
      "#{prefMap['rightToReturnSunnydale']}": 'right-to-return'
    }

    @isPrefWithProof = ->
      _.has(docSectionMap, @preference.preferenceName)

    @docSection = ->
      docSectionMap[@preference.preferenceName]

    return ctrl
  ]
