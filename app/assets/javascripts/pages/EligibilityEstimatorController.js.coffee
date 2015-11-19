############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

EligibilityEstimatorController = ($scope, $state, ListingService) ->
  formDefaults =
    'household_size': ''
    'income_timeframe': ''
    'income_total': ''

  # check if we need to pre-populate the form with our stored filters
  unless angular.equals({}, ListingService.getEligibilityFilters())
    $scope.filters = ListingService.getEligibilityFilters()

  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false

  $scope.submitForm = () ->
    # for now, this doesn't actually "submit", it just clears the form
    if ($scope.eligibilityForm.$valid)
      # submit
      ListingService.setEligibilityFilters($scope.filters)
      $state.go('dahlia.listings')
    else
      $scope.hideAlert = false

  $scope.clearForm = ->
    $scope.eligibilityForm.$setUntouched()
    $scope.eligibilityForm.$setPristine()
    $scope.hideAlert = false
    $scope.filters = angular.copy(formDefaults)
    ListingService.setEligibilityFilters({})

  $scope.inputInvalid = (name) ->
    form = $scope.eligibilityForm
    form[name].$invalid && (form[name].$touched || form.$submitted)

  $scope.showAlert = ->
    form = $scope.eligibilityForm
    # show alert if we've submitted an invalid form, and we haven't manually hidden it
    form.$submitted && form.$invalid && $scope.hideAlert == false


############################################################################################
######################################## CONFIG ############################################
############################################################################################

EligibilityEstimatorController.$inject = ['$scope', '$state', 'ListingService']

angular
  .module('dahlia.controllers')
  .controller('EligibilityEstimatorController', EligibilityEstimatorController)
