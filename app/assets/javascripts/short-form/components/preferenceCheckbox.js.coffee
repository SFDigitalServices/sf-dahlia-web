angular.module('dahlia.components')
.component 'preferenceCheckbox',
  bindings:
    application: '<'
    required: '&'
    invalid: '&'
    title: '@'
    preference: '@'
    description: '@'
    shortDescription: '@'
    onChange: '&'
  templateUrl: 'short-form/components/preference-checkbox.html'

  controller: ['ListingService', (ListingService) ->
    ctrl = @

    @showDescription = false
    listingPreference = ListingService.getPreference(@preference)
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
