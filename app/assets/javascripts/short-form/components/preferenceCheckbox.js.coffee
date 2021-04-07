angular.module('dahlia.components')
.component 'preferenceCheckbox',
  bindings:
    application: '<'
    required: '&'
    invalid: '&'
    title: '@'
    preference: '@'
    translatedDescription: '@'
    customDescription: '@'
    shortDescription: '@'
    readMoreUrl: '@'
    onChange: '&'
  templateUrl: 'short-form/components/preference-checkbox.html'

  controller: ['ListingDataService', 'ListingPreferenceService', (ListingDataService, ListingPreferenceService) ->
    ctrl = @

    listingPreference = ListingPreferenceService.getPreference(@preference, ListingDataService.listing)
    if @readMoreUrl
      # If you can't find the moreInfo link, for example, with a custom preference
      # like 588 Mission, look for a passed readMoreUrl value
      @moreInfoLink = @readMoreUrl
    else if listingPreference
      @moreInfoLink = listingPreference.readMoreUrl

    gtmTags = {
      certOfPreference: 'cop'
      displaced: 'dthp'
      liveInSf: 'livesf'
      workInSf: 'worksf'
      neighborhoodResidence: 'neighborhood'
    }
    tag = gtmTags[@preference]
    tag ?= @preference
    @dataEvent = "gtm-preference-#{tag}"

    return ctrl
  ]
