angular.module('dahlia.components')
.component 'liveWorkComboPreference',
  bindings:
    application: '<'
    currentLiveWorkType: '<'
    title: '@'
    translatedDescription: '@'
    dataEvent: '@'
    required: '&'
  templateUrl: 'short-form/components/live-work-combo-preference.html'

  controller:
    ['ShortFormApplicationService', 'ShortFormHelperService', '$translate',
    (ShortFormApplicationService, ShortFormHelperService, $translate) ->
      ctrl = @
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @eligibleMembers = []
      @memberSelectorLabel = ''

      @initVariables = =>
        @memberSelectorLabel = $translate.instant('LABEL.APPLICANT_PREFERENCES_DOCUMENT_NAME')
        prefs = @application.preferences
        return unless prefs.liveWorkInSf_preference

        @liveWorkInSf_preference = prefs.liveWorkInSf_preference
        @proofOptions = ShortFormHelperService.proofOptions(prefs.liveWorkInSf_preference)
        switch prefs.liveWorkInSf_preference
          when 'liveInSf'
            prefs.liveInSf = true
            @eligibleMembers = ShortFormApplicationService.liveInSfMembers()
            @proofOptionLabel = $translate.instant('LABEL.PREFERENCE_PROOF_ADDRESS_DOCUMENTS')
          when 'workInSf'
            prefs.workInSf = true
            @eligibleMembers = ShortFormApplicationService.workInSfMembers()
            @proofOptionLabel = $translate.instant('LABEL.PREFERENCE_PROOF_DOCUMENTS')

        prefs.documents[prefs.liveWorkInSf_preference] ?= {}
        @proofDocument = prefs.documents[prefs.liveWorkInSf_preference]

      @selectLiveOrWorkPreference = =>
        @resetLiveWorkData()
        @initVariables()

      @onCheckLiveWork = =>
        @resetLiveWorkData()
        @application.preferences.liveWorkInSf_preference = null

      @resetLiveWorkData = ->
        ShortFormApplicationService.cancelOptOut('liveWorkInSf')
        # we don't want to totally "cancelPreference" for live and work
        # otherwise it would unset liveWorkInSf
        ShortFormApplicationService.unsetPreferenceFields('workInSf')
        ShortFormApplicationService.unsetPreferenceFields('liveInSf')

      @liveOrWorkSelected = =>
        preferences = @application.preferences
        preferences.liveInSf || preferences.workInSf

      @initVariables()

      return ctrl

  ]
