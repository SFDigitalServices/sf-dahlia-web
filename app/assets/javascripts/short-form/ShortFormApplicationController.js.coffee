############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShortFormApplicationController = ($scope, $state, ListingService, ShortFormApplicationService, ShortFormNavigationService) ->

  $scope.form = {}
  $scope.$state = $state
  $scope.application = ShortFormApplicationService.application
  $scope.applicant = ShortFormApplicationService.applicant
  $scope.alternateContact = ShortFormApplicationService.alternateContact
  $scope.householdMember = ShortFormApplicationService.householdMember
  $scope.householdMembers = ShortFormApplicationService.householdMembers
  $scope.listing = ListingService.listing
  $scope.gender_options = [
    'Male',
    'Female',
    'Trans Male',
    'Trans Female',
  ]
  $scope.relationship_options = [
      'Spouse',
      'Registered Domestic Partner',
      'Parent',
      'Child',
      'Sibling',
      'Cousin',
      'Aunt',
      'Uncle',
      'Nephew',
      'Niece',
      'Grandparent',
      'Great Grandparent',
      'In-Law',
      'Friend',
      'Other'
    ]
  $scope.ethnicity_options = [
    'Hispanic/Latino',
    'Not Hispanic/Latino'
  ]
  $scope.race_options = [
    'American Indian/Alaskan Native',
    'Asian',
    'Black/African American',
    'Native Hawaiian/Other Pacific Islander',
    'White',
    'American Indian/Alaskan Native and Black/African American',
    'American Indian/Alaskan Native and White',
    'Asian and White',
    'Black/African American and White',
    'Other/Multiracial'
  ]


  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false
  $scope.navService = ShortFormNavigationService

  $scope.submitForm = (options) ->
    form = $scope.form.applicationForm
    if form.$valid
      # submit
      if options.callback && $scope[options.callback]
        $scope[options.callback]()
      if options.path
        $state.go(options.path)
    else
      $scope.hideAlert = false

  $scope.inputInvalid = (fieldName, identifier = '') ->
    form = $scope.form.applicationForm
    fieldName = if identifier then "#{identifier}_#{fieldName}" else fieldName
    field = form[fieldName]
    if form && field
      field.$invalid && (field.$touched || form.$submitted)

  $scope.inputValid = (fieldName, formName = 'applicationForm') ->
    form = $scope.form.applicationForm
    field = form[fieldName]
    field.$valid if form && field

  $scope.blankIfInvalid = (fieldName) ->
    form = $scope.form.applicationForm
    $scope.applicant[fieldName] = '' if form[fieldName].$invalid

  $scope.formattedAddress = (listing) ->
    ListingService.formattedAddress(listing)

  $scope.applicantHasPhoneEmailAndAddress = ->
    $scope.applicant.phone_number &&
      $scope.applicant.email &&
      ShortFormApplicationService.validMailingAddress()

  $scope.validMailingAddress = ->
    ShortFormApplicationService.validMailingAddress()

  $scope.missingPrimaryContactInfo = ->
    ShortFormApplicationService.missingPrimaryContactInfo()

  $scope.isMissingPrimaryContactInfo = (info) ->
    ShortFormApplicationService.missingPrimaryContactInfo().indexOf(info) > -1

  $scope.isMissingAddress = ->
    $scope.isMissingPrimaryContactInfo('Address')

  $scope.unsetNoAddressAndCheckMailingAddress = ->
    # $scope.applicant.noAddress = false
    $scope.checkIfMailingAddressNeeded()

  $scope.checkIfMailingAddressNeeded = ->
    if $scope.applicant.noAddress && ShortFormApplicationService.validMailingAddress()
      $scope.applicant.noAddress = false
    unless $scope.applicant.separateAddress
      ShortFormApplicationService.copyHomeToMailingAddress()

  $scope.resetAndCheckMailingAddress = ->
    #reset mailing address
    $scope.applicant.mailing_address = {}
    $scope.checkIfMailingAddressNeeded()

  $scope.checkIfAlternateContactInfoNeeded = ->
    if $scope.alternateContact.type == 'None'
      # skip ahead if they aren't filling out an alt. contact
      $state.go('dahlia.short-form-application.optional-info')
    else
      $state.go('dahlia.short-form-application.alternate-contact-name')

  $scope.hasNav = ->
    ShortFormNavigationService.hasNav()

  $scope.activeSection = ->
    ShortFormNavigationService.activeSection()

  $scope.homeAddressRequired = ->
    !($scope.applicant.noAddress || $scope.applicant.separateAddress)

  $scope.truth = ->
    # wrap true value in a function a la function(){return true;}
    # used by isRequired() in _address_form
    true

  $scope.resetGenderOptions = (user, option) ->
    ShortFormApplicationService.resetGenderOptions(user, option)

  $scope.genderOtherOptionSelected = (user) ->
    user.gender['Not Listed'] || user.gender['Decline to State']

  ###### Household Section ########
  $scope.getHouseholdMember = ->
    $scope.householdMember = ShortFormApplicationService.householdMember

  $scope.addHouseholdMember = ->
    ShortFormApplicationService.addHouseholdMember($scope.householdMember)

  $scope.cancelHouseholdMember = ->
    ShortFormApplicationService.cancelHouseholdMember()
    $state.go('dahlia.short-form-application.household-members')

ShortFormApplicationController.$inject = ['$scope', '$state', 'ListingService', 'ShortFormApplicationService', 'ShortFormNavigationService']

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
