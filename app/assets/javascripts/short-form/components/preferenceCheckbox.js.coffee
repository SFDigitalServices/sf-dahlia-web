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
  templateUrl: 'short-form/components/preference-checkbox.html'

  controller: ['ListingDataService', 'ListingPreferenceService', (ListingDataService, ListingPreferenceService) ->
    ctrl = @

    # Try to find the listing preference. If we can't find it by our custom name (e.g. for 588 Mission),
    # try to find it by custom preference ID.
    listingPreference = (
      ListingPreferenceService.getPreference(@preference, ListingDataService.listing) ||
      ListingPreferenceService.getPreferenceById(@preference, ListingDataService.listing)
    )

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
