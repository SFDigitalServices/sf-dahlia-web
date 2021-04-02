angular.module('dahlia.components')
.component 'preference',
  bindings:
    preference: '@'
    application: '<'
    hasProof: '<'
    hasCertificate: '<'
    title: '@'
    translatedDescription: '@'
    customDescription: '@'
    readMoreUrl: '@'
    translatedShortDescription: '@'
    proofOptionLabel: '@'
    buttonLabel: '@'
    proofType: '@'
    marginBottom: '<'
    required: '&'
  templateUrl: 'short-form/components/preference-component.html'

  controller:
    ['ShortFormApplicationService', 'ShortFormHelperService', '$translate',
    (ShortFormApplicationService, ShortFormHelperService, $translate) ->
      ctrl = @
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @eligibleMembers = []
      @memberSelectorLabel = ''

      @initVariables = =>
        @buttonLabel ?= $translate.instant('label.upload_proof_of_preference')
        prefs = @application.preferences
        if @hasProof
          @memberSelectorLabel = $translate.instant('label.applicant_preferences_document_name')
          prefs.documents[@preference] ?= {}
          @proofDocument = prefs.documents[@preference]
        else
          @memberSelectorLabel = $translate.instant('label.applicant_preferences_household_member')
        @eligibleMembers = ShortFormApplicationService.eligibleMembers(@preference)
        @proofOptions = ShortFormHelperService.proofOptions(@preference)

      @resetPreference = =>
        if !@application.preferences[@preference]
          # unchecking the box
          ShortFormApplicationService.cancelPreference(@preference)
        else
          # checking the box
          ShortFormApplicationService.cancelOptOut(@preference)

      @onChange = =>
        @resetPreference()

      # For 588 Mission preference, we need to override some defaults.
      @is588 = =>
        @title == 'Employment/Disability Preference'

      @preferenceId = =>
        if @is588() then 'five88' else @preference

      @descriptionToTranslate = =>
        if @is588() then "e7b_custom_preferences.five88_mission.description" else @translatedDescription

      @initVariables()

      return ctrl

  ]
