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
        console.log('preference from reset preference', @preference)
        if !@application.preferences[@preference]
          # unchecking the box
          ShortFormApplicationService.cancelPreference(@preference)
        else
          # checking the box
          ShortFormApplicationService.cancelOptOut(@preference)

      @onChange = =>
        @resetPreference()

      @preferenceId = =>
        id = if @is588() then 'five88' else @preference
        return id
      @is588 = =>
        is588Pref = @title == 'Employment/Disability Preference'
        return is588Pref

      @initVariables()

      return ctrl

  ]
