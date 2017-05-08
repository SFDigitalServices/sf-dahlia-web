angular.module('dahlia.components')
.component 'addressForm',
  bindings:
    addressType: '@'
    isRequired: '@'
    model: '<'
    onChange: '&'
  templateUrl: 'short-form/components/address-form.html'

  controller:
    ['ShortFormApplicationService', (ShortFormApplicationService) ->
      ctrl = @

      @inputInvalid = (fieldName, identifier) ->
        ShortFormApplicationService.inputInvalid(fieldName, identifier)

      return ctrl

  ]
