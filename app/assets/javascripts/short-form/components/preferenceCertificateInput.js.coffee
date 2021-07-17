angular.module('dahlia.components')
.component 'preferenceCertificateInput',
  bindings:
    application: '<'
    preference: '@'
    captionKey: '<'
    labelKey: '<'
  templateUrl: 'short-form/components/preference-certificate-input.html'

  controller:
    ['$translate', 'ShortFormApplicationService', 'inputMaxLength'
    ($translate, ShortFormApplicationService, inputMaxLength) ->
      ctrl = @
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      if @preference == 'certOfPreference'
        @label = $translate.instant('e7_preferences_programs.cert_of_preference_certificate')
      else if @preference == 'displaced'
        @label = $translate.instant('e7_preferences_programs.displaced_certificate')
      else
        @label = $translate.instant(@labelKey)

      if @captionKey
        @caption = $translate.instant(@captionKey)
      else
        @caption = $translate.instant(
          'e7_preferences_programs.need_certificate_for_preference')

      @preferenceCertificateNumber = "#{@preference}_certificateNumber"
      @INPUT_MAX_LENGTH = inputMaxLength

      return ctrl
  ]
