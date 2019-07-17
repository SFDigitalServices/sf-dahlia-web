angular.module('dahlia.components')
.component 'preferenceCertificateInput',
  bindings:
    application: '<'
    preference: '@'
  template: require('html-loader!application/short-form/components/preference-certificate-input.html')

  controller:
    ['$translate', 'ShortFormApplicationService', 'inputMaxLength'
    ($translate, ShortFormApplicationService, inputMaxLength) ->
      ctrl = @
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      if @preference == 'certOfPreference'
        @label = $translate.instant('E7_PREFERENCES_PROGRAMS.CERT_OF_PREFERENCE_CERTIFICATE')
      else if @preference == 'displaced'
        @label = $translate.instant('E7_PREFERENCES_PROGRAMS.DISPLACED_CERTIFICATE')

      @preferenceCertificateNumber = "#{@preference}_certificateNumber"
      @INPUT_MAX_LENGTH = inputMaxLength

      return ctrl
  ]
