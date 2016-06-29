############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShortFormApplicationController = (
  $scope,
  $state,
  $window,
  $document,
  $translate,
  Idle,
  Title,
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
  $scope.preferences = ShortFormApplicationService.preferences
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

  unless ShortFormApplicationService.isWelcomePage($state.current) || $window.jasmine
    # don't add this onbeforeunload inside of jasmine tests
    $window.addEventListener 'beforeunload', ShortFormApplicationService.onExit

  $scope.submitForm = (options) ->
    form = $scope.form.applicationForm
    if form.$valid
      # submit
      if options.callback && $scope[options.callback]
        $scope[options.callback]()
      if options.path
        $state.go(options.path)
    else
      $scope.handleErrorState()

  $scope.handleErrorState = ->
    # show error alert
    $scope.hideAlert = false
    el = angular.element(document.getElementById('short-form-wrapper'))
    # uses duScroll aka 'angular-scroll' module
    topOffset = 0
    duration = 400 # animation speed in ms
    $document.scrollToElement(el, topOffset, duration)

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
    $scope.inputInvalid('phone') ||
    $scope.inputInvalid('phoneType') ||
    $scope.inputInvalid('alternatePhone') ||
    $scope.inputInvalid('alternatePhoneType')

  $scope.inputValid = (fieldName, formName = 'applicationForm') ->
    form = $scope.form.applicationForm
    field = form[fieldName]
    field.$valid if form && field

  $scope.blankIfInvalid = (fieldName) ->
    form = $scope.form.applicationForm
    if typeof form[fieldName] != 'undefined'
      $scope.applicant[fieldName] = '' if form[fieldName].$invalid

  $scope.clearPhoneData = (type) ->
    ShortFormApplicationService.clearPhoneData(type)

  $scope.applicantHasPhoneEmailAndAddress = ->
    $scope.applicant.phone &&
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
    unless $scope.applicant.hasAltMailingAddress
      ShortFormApplicationService.copyHomeToMailingAddress()

  $scope.resetHomeAddress = ->
    #reset home address
    $scope.applicant.home_address = {}

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

  $scope.checkIfAlternateContactInfoNeeded = ->
    if $scope.alternateContact.alternateContactType == 'None'
      ShortFormApplicationService.clearAlternateContactDetails()
      # skip ahead if they aren't filling out an alt. contact
      $state.go("dahlia.short-form-application.#{$scope.getHouseholdLandingPage()}")
    else
      if $scope.alternateContact.alternateContactType != 'Social worker or housing counselor'
        $scope.alternateContact.agency = null
      $state.go('dahlia.short-form-application.alternate-contact-name')

  $scope.checkIfAlternateContactNeedsReset = ->
    # blank out alternateContact.alternateContactType if it was previously set to 'None' but that is no longer valid
    if (!$scope.applicantHasPhoneEmailAndAddress() && $scope.alternateContact.alternateContactType == 'None')
      $scope.alternateContact.alternateContactType = null

  $scope.hasNav = ->
    ShortFormNavigationService.hasNav()

  $scope.hasBackButton = ->
    ShortFormNavigationService.hasBackButton()

  $scope.backPageState = ->
    ShortFormNavigationService.backPageState($scope.application)

  $scope.homeAddressRequired = ->
    !($scope.applicant.noAddress || $scope.applicant.hasAltMailingAddress)

  $scope.truth = ->
    # wrap true value in a function a la function(){return true;}
    # used by isRequired() in _address_form
    true

  $scope.resetGenderOptions = (user, option) ->
    ShortFormApplicationService.resetGenderOptions(user, option)

  $scope.genderOtherOptionSelected = (user) ->
    user.gender['Not Listed'] || user.gender['Decline to State']

  $scope.getLandingPage = (section) ->
    ShortFormNavigationService.getLandingPage(section, $scope.application)

  $scope.getHouseholdLandingPage = (section) ->
    $scope.getLandingPage({name: 'Household'})

  ###### Proof of Preferences Logic ########
  $scope.checkLiveWorkEligibility = () ->
    ShortFormApplicationService.refreshLiveWorkPreferences()

  $scope.liveInSfMembers = ->
    ShortFormApplicationService.liveInSfMembers()

  $scope.workInSfMembers = ->
    ShortFormApplicationService.workInSfMembers()

  ###### Household Section ########
  $scope.getHouseholdMember = ->
    $scope.householdMember = ShortFormApplicationService.householdMember

  $scope.addHouseholdMember = ->
    ShortFormApplicationService.addHouseholdMember($scope.householdMember)
    if ($scope.householdMember.hasSameAddressAsApplicant == 'Yes' ||
        ($scope.householdMember.confirmed_home_address &&
        AddressValidationService.isConfirmed($scope.householdMember.home_address, 'home')))
      # skip ahead if they aren't filling out an address
      # or their current address has already been confirmed
      $state.go('dahlia.short-form-application.household-members')
    else
      $state.go('dahlia.short-form-application.household-member-verify-address', {member_id: $scope.householdMember.id})

  $scope.cancelHouseholdMember = ->
    ShortFormApplicationService.cancelHouseholdMember()
    $state.go('dahlia.short-form-application.household-members')

  $scope.householdEligibilityErrorMessage = null

  $scope.validateHouseholdEligibility = (match, callbackUrl) ->
    $scope.clearHouseholdErrorMessage()
    form = $scope.form.applicationForm
    ShortFormApplicationService.checkHouseholdEligiblity($scope.listing)
      .then( (response) ->
        $scope._respondToHouseholdEligibilityResults(response, match, callbackUrl)
      )

  $scope._respondToHouseholdEligibilityResults = (response, match, callbackUrl) ->
    eligibility = response.data
    if eligibility[match]
      $scope.householdEligibilityErrorMessage = null
      $state.go(callbackUrl)
    else
      $scope._determineHouseholdErrorMessage(eligibility, 'householdEligibilityResult') if match == 'householdMatch'
      $scope._determineHouseholdErrorMessage(eligibility, 'incomeEligibilityResult') if match == 'incomeMatch'
      $scope.hideAlert = false

  $scope.clearHouseholdErrorMessage = () ->
    $scope.householdEligibilityErrorMessage = null

  $scope._determineHouseholdErrorMessage= (eligibility, errorResult) ->
    error = eligibility[errorResult].toLowerCase()
    message = null
    if error == 'too big'
      message = $translate.instant("ERROR.HOUSEHOLD_TOO_BIG")
    else if error == 'too small'
      message = $translate.instant("ERROR.HOUSEHOLD_TOO_SMALL")
    else if error == 'too low'
      message = $translate.instant("ERROR.HOUSEHOLD_INCOME_TOO_LOW")
    else if error == 'too high'
      message = $translate.instant("ERROR.HOUSEHOLD_INCOME_TOO_HIGH")
    $scope.householdEligibilityErrorMessage = message

  ## helpers
  $scope.alternateContactRelationship = ->
    ShortFormHelperService.alternateContactRelationship($scope.alternateContact)

  $scope.applicantLanguage = ->
    ShortFormHelperService.applicantLanguage($scope.applicant)

  $scope.applicationVouchersSubsidies = ->
    ShortFormHelperService.applicationVouchersSubsidies($scope.application)

  $scope.applicantIncomeAmount = ->
    ShortFormHelperService.applicantIncomeAmount($scope.applicant)

  ## translation helpers
  $scope.applicantFirstName = ->
    ShortFormHelperService.applicantFirstName($scope.applicant)

  $scope.householdMemberForPreference = (pref_type) ->
    ShortFormHelperService.householdMemberForPreference($scope.application, pref_type)


  ## idle timeout functions
  unless ShortFormApplicationService.isWelcomePage($state.current)
    Idle.watch()

  $scope.$on 'IdleStart', ->
    # user has now been idle for x period of time, warn them of logout!
    $window.alert($translate.instant('T.SESSION_INACTIVITY'))

  $scope.$on 'IdleTimeout', ->
    # they ran out of time
    ShortFormApplicationService.resetUserData()
    $window.removeEventListener 'beforeunload', ShortFormApplicationService.onExit
    Title.restore()
    $state.go('dahlia.listing', {timeout: true, id: $scope.listing.Id})

ShortFormApplicationController.$inject = [
  '$scope', '$state', '$window', '$document', '$translate', 'Idle', 'Title',
  'ListingService', 'ShortFormApplicationService', 'ShortFormNavigationService', 'ShortFormHelperService', 'AddressValidationService'
]

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
