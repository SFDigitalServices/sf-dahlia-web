############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShortFormApplicationController = ($scope, $state, ListingService, ShortFormApplicationService) ->

  $scope.application = ShortFormApplicationService.application
  $scope.applicant = ShortFormApplicationService.applicant
  $scope.listing = ListingService.listing
  $scope.sections = [
    { name: 'You', pages:[ 'name', 'contact', 'alternate-contact', 'alternate-contact-required']},
    { name: 'Household', pages: ['intro'] },
    { name: 'Status', pages: ['intro'] },
    { name: 'Income', pages: ['intro'] },
    { name: 'Review', pages: ['intro'] }
  ]

  $scope.formattedAddress = (listing) ->
    ListingService.formattedAddress(listing)

  $scope.hasNav = ->
    $state.current.name != 'dahlia.short-form-application.intro'

  $scope.isActiveSection = (section) ->
    stateName = $state.current.name.replace('dahlia.short-form-application.', "")
    section.pages.indexOf(stateName) > -1

  $scope.applicantHasPhoneAndAddress = () ->
    $scope.applicant.phone_number && ShortFormApplicationService.validMailingAddress()

  $scope.missingPrimaryContactInfo = () ->
    ShortFormApplicationService.missingPrimaryContactInfo()

  $scope.checkIfMailingAddressNeeded = () ->
    if !$scope.applicant.separateAddress
      ShortFormApplicationService.copyHomeToMailingAddress()

  $scope.checkSeparateAddress = () ->
    #reset mailing address
    $scope.applicant.mailingAddress = {}
    $scope.checkIfMailingAddressNeeded()

  $scope.determineAlternateContactRequired = () ->
    if $scope.applicantHasPhoneAndAddress()
      $state.go('dahlia.short-form-application.alternate-contact')
    else
      $state.go('dahlia.short-form-application.alternate-contact-required')


angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
