############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShortFormApplicationController = ($scope, $state, ListingService, ShortFormApplicationService) ->

  $scope.application = ShortFormApplicationService.application
  $scope.applicant = ShortFormApplicationService.applicant
  $scope.alternateContact = ShortFormApplicationService.alternateContact
  $scope.listing = ListingService.listing
  $scope.sections = [
    { name: 'You', pages: [
        'name',
        'contact',
        'alternate-contact-required',
        'alternate-contact-type',
        'alternate-contact-name',
        'alternate-contact-phone-address',
        'optional-info'
      ]
    },
    { name: 'Household', pages: ['intro'] },
    { name: 'Status', pages: ['intro'] },
    { name: 'Income', pages: ['intro'] },
    { name: 'Review', pages: ['intro'] }
  ]
  $scope.gender_options = ['Male', 'Female', 'Trans Male', 'Trans Female', 'Not listed', 'Decline to state']

  $scope.formattedAddress = (listing) ->
    ListingService.formattedAddress(listing)

  $scope.hasNav = ->
    $state.current.name != 'dahlia.short-form-application.intro'

  $scope.isActiveSection = (section) ->
    stateName = $state.current.name.replace('dahlia.short-form-application.', "")
    section.pages.indexOf(stateName) > -1

  $scope.applicantHasPhoneAndAddress = ->
    $scope.applicant.phone_number && ShortFormApplicationService.validMailingAddress()

  $scope.missingPrimaryContactInfo = ->
    ShortFormApplicationService.missingPrimaryContactInfo()

  $scope.checkIfMailingAddressNeeded = ->
    if !$scope.applicant.separateAddress
      ShortFormApplicationService.copyHomeToMailingAddress()

  $scope.checkSeparateAddress = ->
    #reset mailing address
    $scope.applicant.mailing_address = {}
    $scope.checkIfMailingAddressNeeded()

  $scope.checkIfAlternateContactRequired = ->
    if $scope.applicantHasPhoneAndAddress()
      $state.go('dahlia.short-form-application.alternate-contact-type')
    else
      $state.go('dahlia.short-form-application.alternate-contact-required')

  $scope.checkIfAlternateContactInfoNeeded = ->
    if $scope.alternateContact.type == 'None'
      # skip ahead if they aren't filling out an alt. contact
      $state.go('dahlia.short-form-application.optional-info')
    else
      $state.go('dahlia.short-form-application.alternate-contact-name')


angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
