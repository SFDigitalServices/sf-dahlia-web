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
        @memberSelectorLabel = $translate.instant('label.applicant_preferences_document_name')
        prefs = @application.preferences
        unless prefs.liveWorkInSf_preference
          prefs.workInSf = false
          prefs.liveInSf = false
          return

        @liveWorkInSf_preference = prefs.liveWorkInSf_preference
        @proofOptions = ShortFormHelperService.proofOptions(prefs.liveWorkInSf_preference)
        switch prefs.liveWorkInSf_preference
          when 'liveInSf'
            prefs.liveInSf = true
            @eligibleMembers = ShortFormApplicationService.liveInSfMembers()
            @proofOptionLabel = $translate.instant('label.preference_proof_address_documents')
          when 'workInSf'
            prefs.workInSf = true
            @eligibleMembers = ShortFormApplicationService.workInSfMembers()
            @proofOptionLabel = $translate.instant('label.preference_proof_documents')

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
