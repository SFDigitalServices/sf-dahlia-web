angular.module('dahlia.components')
.component 'preferenceRightToReturn',
  bindings:
    application: '<'
    required: '&'
    invalid: '&'
    title: '@'
    preference: '@'
    preferenceKey: '<'
    translatedDescription: '@'
    customDescription: '@'
    shortDescription: '@'
    onChange: '&'
  templateUrl: 'short-form/components/preference-right-to-return.html'

  controller: ['$translate', 'ListingDataService', 'ListingPreferenceService', ($translate, ListingDataService, ListingPreferenceService) ->
    ctrl = @

    # Try to find the listing preference.
    listingPreference = (
      ListingPreferenceService.getPreference(@preference, ListingDataService.listing) ||
      ListingPreferenceService.getPreferenceById(@preference, ListingDataService.listing)
    )
    @addressType = @preferenceKey + '_address'

    rtrTranslationKey =
      switch @preferenceKey
        when 'rightToReturnSunnydale'
          'rtr_sunnydale'
        when 'aliceGriffith'
          'alice_griffith'


    @preferenceDesc = $translate.instant("preferences.#{rtrTranslationKey}.desc")
    @preferenceTitle = $translate.instant("preferences.#{rtrTranslationKey}.title")
    @preferenceAddressTitle = $translate.instant("preferences.#{rtrTranslationKey}.address")
    @preferenceAddressDesc = $translate.instant("preferences.#{rtrTranslationKey}.address_desc")
    return ctrl
  ]
