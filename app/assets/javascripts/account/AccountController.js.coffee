AccountController = ($scope, $state, AccountService, ShortFormApplicationService) ->
  $scope.rememberedShortFormState = AccountService.rememberedShortFormState
  $scope.form = {}
  # userAuth is used as model for inputs in create-account form
  $scope.userAuth = AccountService.userAuth
  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false

  $scope.inputInvalid = (fieldName, identifier = '') ->
    form = $scope.form.accountForm
    fieldName = if identifier then "#{identifier}_#{fieldName}" else fieldName
    field = form[fieldName]
    if form && field
      field.$invalid && (field.$touched || form.$submitted)

  $scope.createAccount = ->
    form = $scope.form.accountForm
    if form.$valid
      # AccountService.userAuth will have been modified by form inputs
      AccountService.createAccount().then( (success) ->
        if success
          form.$setUntouched()
          form.$setPristine()
          $scope._redirect()
      )
    else
      $scope.hideAlert = false

  $scope.signIn = ->
    form = $scope.form.accountForm
    if form.$valid
      # AccountService.userAuth will have been modified by form inputs
      AccountService.signIn().then ->
        if AccountService.loggedIn()
          return $state.go('dahlia.my-account')
    else
      $scope.hideAlert = false

  $scope._redirect = ->
    # send to sign in state if user created account from saving application
    if $state.current.name == 'dahlia.short-form-application.create-account'
      ShortFormApplicationService.submitApplication({draft: true}).then(
        $state.go('dahlia.sign-in')
      )


AccountController.$inject = ['$scope', '$state', 'AccountService', 'ShortFormApplicationService']

angular
  .module('dahlia.controllers')
  .controller('AccountController', AccountController)
