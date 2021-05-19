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

  controller: ['ListingDataService', 'ListingPreferenceService', (ListingDataService, ListingPreferenceService) ->
    ctrl = @

    # Try to find the listing preference.
    listingPreference = (
      ListingPreferenceService.getPreference(@preference, ListingDataService.listing) ||
      ListingPreferenceService.getPreferenceById(@preference, ListingDataService.listing)
    )

    if listingPreference
      @moreInfoLink = listingPreference.readMoreUrl

    return ctrl
  ]
