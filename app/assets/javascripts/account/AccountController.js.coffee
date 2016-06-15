AccountController = ($scope, AccountService) ->
  $scope.rememberedState = AccountService.rememberedState
  $scope.form = {}
  $scope.userAuth = AccountService.userAuth
  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false

  $scope.continueApplication = ->
    AccountService.returnToRememberedState()

  $scope.inputInvalid = (fieldName, identifier = '') ->
    form = $scope.form.accountForm
    fieldName = if identifier then "#{identifier}_#{fieldName}" else fieldName
    field = form[fieldName]
    if form && field
      field.$invalid && (field.$touched || form.$submitted)

  $scope.createAccount = ->
    form = $scope.form.accountForm
    if form.$valid
      AccountService.createAccount()
    else
      $scope.hideAlert = false

AccountController.$inject = ['$scope', 'AccountService']

angular
  .module('dahlia.controllers')
  .controller('AccountController', AccountController)
