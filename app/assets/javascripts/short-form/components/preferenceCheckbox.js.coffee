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
    displayMoreInfoLink: '<'
    onChange: '&'
  templateUrl: 'short-form/components/preference-checkbox.html'

  controller: ->
    ctrl = @

    @showDescription = false
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
