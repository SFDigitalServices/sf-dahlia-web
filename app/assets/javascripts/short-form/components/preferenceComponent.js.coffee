angular.module('dahlia.components')
.component 'preference',
  bindings:
    preference: '@'
    application: '<'
    hasProof: '<'
    title: '@'
    translatedDescription: '@'
    displayMoreInfoLink: '<'
    proofOptionLabel: '@'
    buttonLabel: '@'
    proofType: '@'
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
        @buttonLabel ?= $translate.instant('LABEL.UPLOAD_PROOF_OF_PREFERENCE')
        prefs = @application.preferences
        if @hasProof
          @memberSelectorLabel = $translate.instant('LABEL.APPLICANT_PREFERENCES_DOCUMENT_NAME')
          prefs.documents[@preference] ?= {}
          @proofDocument = prefs.documents[@preference]
        else
          @memberSelectorLabel = $translate.instant('LABEL.APPLICANT_PREFERENCES_HOUSEHOLD_MEMBER')
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

      @initVariables()

      return ctrl

  ]
