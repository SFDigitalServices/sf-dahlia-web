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
    onChange: '&'
  template: require('html-loader!application/short-form/components/preference-checkbox.html')

  controller: ['ListingDataService', 'ListingPreferenceService', (ListingDataService, ListingPreferenceService) ->
    ctrl = @

    @showDescription = false
    listingPreference = ListingPreferenceService.getPreference(@preference, ListingDataService.listing)
    if listingPreference
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
