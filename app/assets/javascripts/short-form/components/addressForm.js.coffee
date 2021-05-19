angular.module('dahlia.components')
.component 'addressForm',
  bindings:
    addressType: '<'
    isRequired: '@'
    model: '<'
    modelName: '<'
    onChange: '&'
    hideAddress2: '@'
  templateUrl: 'short-form/components/address-form.html'

  controller:
    ['ShortFormApplicationService', 'inputMaxLength', '$scope',
    (ShortFormApplicationService, inputMaxLength, $scope) ->
      ctrl = @
      @latinRegex = ShortFormApplicationService.latinRegex

      @inputInvalid = (fieldName) =>
        fieldName = "#{@addressType}_#{fieldName}"
        ShortFormApplicationService.inputInvalid(fieldName)

      # these get set up purely so that inputErrorDirective can continue to function as normal
      $scope.inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)
      $scope.form = ShortFormApplicationService.form

      @INPUT_MAX_LENGTH = inputMaxLength

      return ctrl

  ]
