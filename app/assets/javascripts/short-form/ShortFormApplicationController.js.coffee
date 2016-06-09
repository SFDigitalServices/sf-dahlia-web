############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShortFormApplicationController = (
  $scope,
  $state,
  $window,
  $translate,
  ListingService,
  ShortFormApplicationService,
  ShortFormNavigationService,
  ShortFormHelperService,
  AddressValidationService
) ->

  $scope.form = {}
  $scope.$state = $state
  $scope.application = ShortFormApplicationService.application
  $scope.applicant = ShortFormApplicationService.applicant
  $scope.alternateContact = ShortFormApplicationService.alternateContact
  $scope.householdMember = ShortFormApplicationService.householdMember
  $scope.householdMembers = ShortFormApplicationService.householdMembers
  $scope.listing = ListingService.listing
  $scope.validated_mailing_address = AddressValidationService.validated_mailing_address
  $scope.validated_home_address = AddressValidationService.validated_home_address

  ## form options
  $scope.alternate_contact_options = ShortFormHelperService.alternate_contact_options
  $scope.gender_options = [
    'Male',
    'Female',
    'Trans Male',
    'Trans Female',
  ]
  $scope.language_options = [
    'English',
    'Cantonese Chinese',
    'Mandarin Chinese',
    'Spanish',
    'Filipino',
    'Vietnamese',
    'Russian',
    'Other'
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
    'Not Hispanic/Latino',
    'Decline to state'
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
    'Other/Multiracial',
    'Decline to state'
  ]
  $scope.preference_proof_options = [
    'Telephone bill (land line only)',
    'Cable and internet bill',
    'Gas bill',
    'Electric bill',
    'Garbage bill',
    'Water bill',
    'Paystub (listing home address)',
    'Public benefits record',
    'School record'
  ]

  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false
  $scope.navService = ShortFormNavigationService
  $scope.appService = ShortFormApplicationService

  $scope.onExit = ->
    "Are you sure you would like to navigate away from this page?
    You will lose all information you've entered into the application
    for this listing. If you'd like to save your information to finish
    the application at a later time, please click the 'Save and Finish later' button."

  unless $window.jasmine # don't add this onbeforeunload inside of jasmine tests
    $window.onbeforeunload = $scope.onExit

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

  $scope.addressInputInvalid = (identifier = '') ->
    if $scope.addressFailedValidation(identifier)
      return true
    $scope.inputInvalid('address1', identifier) ||
    $scope.inputInvalid('city', identifier) ||
    $scope.inputInvalid('state', identifier) ||
    $scope.inputInvalid('zip', identifier)

  $scope.addressFailedValidation = (identifier = '') ->
    validated = $scope["validated_#{identifier}"]
    return AddressValidationService.failedValidation(validated)

  $scope.checkInvalidPhones = () ->
    $scope.inputInvalid('phone_number') ||
    $scope.inputInvalid('phone_number_type') ||
    $scope.inputInvalid('second_phone_number') ||
    $scope.inputInvalid('second_phone_number_type')

  $scope.inputValid = (fieldName, formName = 'applicationForm') ->
    form = $scope.form.applicationForm
    field = form[fieldName]
    field.$valid if form && field

  $scope.blankIfInvalid = (fieldName) ->
    form = $scope.form.applicationForm
    if typeof form[fieldName] != 'undefined'
      $scope.applicant[fieldName] = '' if form[fieldName].$invalid

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

  $scope.checkIfAddressVerificationNeeded = ->
    if ($scope.applicant.noAddress ||
        ($scope.applicant.confirmed_home_address &&
        AddressValidationService.isConfirmed($scope.applicant.home_address, 'home')))
      # skip ahead if they aren't filling out an address
      # or their current address has already been confirmed
      $state.go('dahlia.short-form-application.alternate-contact-type')
    else
      $state.go('dahlia.short-form-application.verify-address')

  $scope.checkValidatedAddressSelection = ->
    $state.go('dahlia.short-form-application.alternate-contact-type')

  $scope.checkIfAlternateContactInfoNeeded = ->
    if $scope.alternateContact.type == 'None'
      # skip ahead if they aren't filling out an alt. contact
      $state.go('dahlia.short-form-application.household-intro')
    else
      $state.go('dahlia.short-form-application.alternate-contact-name')

  $scope.checkIfAlternateContactNeedsReset = ->
    # blank out alternateContact.type if it was previously set to 'None' but that is no longer valid
    if (!$scope.applicantHasPhoneEmailAndAddress() && $scope.alternateContact.type == 'None')
      $scope.alternateContact.type = null

  $scope.hasNav = ->
    ShortFormNavigationService.hasNav()

  $scope.hasBackButton = ->
    ShortFormNavigationService.hasBackButton()

  $scope.backPageState = ->
    ShortFormNavigationService.backPageState($scope.application)

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

  ###### Proof of Preferences Logic ########
  $scope.checkLiveWorkEligibility = () ->
    ShortFormApplicationService.livesInSf()
    ShortFormApplicationService.worksInSf()

  ###### Household Section ########
  $scope.getHouseholdMember = ->
    $scope.householdMember = ShortFormApplicationService.householdMember

  $scope.addHouseholdMember = ->
    ShortFormApplicationService.addHouseholdMember($scope.householdMember)

  $scope.cancelHouseholdMember = ->
    ShortFormApplicationService.cancelHouseholdMember()
    $state.go('dahlia.short-form-application.household-members')

  ## helpers
  $scope.alternateContactRelationship = ->
    ShortFormHelperService.alternateContactRelationship($scope.alternateContact)

  $scope.applicantPrimaryLanguage = ->
    ShortFormHelperService.applicantPrimaryLanguage($scope.applicant)

  $scope.applicantVouchersSubsidies = ->
    ShortFormHelperService.applicantVouchersSubsidies($scope.applicant)

  $scope.applicantIncomeAmount = ->
    ShortFormHelperService.applicantIncomeAmount($scope.applicant)

  ## translation helpers
  $scope.applicantFirstName = ->
    ShortFormHelperService.applicantFirstName($scope.applicant)

  $scope.householdMemberForPreference = (pref_type) ->
    ShortFormHelperService.householdMemberForPreference($scope.application, pref_type)

ShortFormApplicationController.$inject = [
  '$scope', '$state', '$window', '$translate',
  'ListingService', 'ShortFormApplicationService', 'ShortFormNavigationService', 'ShortFormHelperService', 'AddressValidationService'
]

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
