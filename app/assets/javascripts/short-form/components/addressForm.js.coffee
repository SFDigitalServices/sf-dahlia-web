angular.module('dahlia.components')
.component 'addressForm',
  bindings:
    addressType: '@'
    isRequired: '@'
    model: '<'
    modelName: '@'
    onChange: '&'
  templateUrl: 'short-form/components/address-form.html'

  controller:
    ['ShortFormApplicationService', 'inputMaxLength', (ShortFormApplicationService, inputMaxLength) ->
      ctrl = @

      @inputInvalid = (fieldName, identifier) ->
        ShortFormApplicationService.inputInvalid(fieldName, identifier)

      @INPUT_MAX_LENGTH = inputMaxLength

      return ctrl

  ]
