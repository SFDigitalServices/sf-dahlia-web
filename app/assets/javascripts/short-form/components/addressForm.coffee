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
    ['ShortFormApplicationService', '$scope',
    (ShortFormApplicationService, $scope) ->
      ctrl = @
      @latinRegex = new RegExp("^[A-z0-9\u00C0-\u017E\s'\.,-\/#!$%\^&\*;:{}=\-_`~()]+$")

      @inputInvalid = (fieldName) =>
        fieldName = "#{@addressType}_#{fieldName}"
        ShortFormApplicationService.inputInvalid(fieldName)

      # these get set up purely so that inputErrorDirective can continue to function as normal
      $scope.inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)
      $scope.form = ShortFormApplicationService.form

      return ctrl

  ]
