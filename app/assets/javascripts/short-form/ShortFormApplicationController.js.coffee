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
  ListingService,
  ShortFormApplicationService,
  ShortFormNavigationService,
  ShortFormHelperService,
  AddressValidationService
) ->

  $scope.form = ShortFormApplicationService.form
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
  $scope.sexual_orientation_options = [
    'Straight/Heterosexual',
    'Gay',
    'Lesbian',
    'Bisexual',
    'Questioning/Unsure',
    'Not Listed',
    'Decline to state'
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

  $scope.resetHouseholdMemberAddress = ->
    delete $scope.householdMember.home_address

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
  $scope.checkIfPreferencesApply = () ->
    if $scope._preferencesApplyForHousehold()
      $state.go('dahlia.short-form-application.live-work-preference')
    else
      $state.go('dahlia.short-form-application.general-lottery-notice')

  $scope._preferencesApplyForHousehold = () ->
    ShortFormApplicationService.preferencesApplyForHousehold()

  $scope.checkLiveWorkEligibility = () ->
    ShortFormApplicationService.refreshLiveWorkPreferences()

  $scope.liveInSfMembers = ->
    ShortFormApplicationService.liveInSfMembers()

  $scope.workInSfMembers = ->
    ShortFormApplicationService.workInSfMembers()

  $scope.neighborhoodResidenceMembers = ->
    ShortFormApplicationService.neighborhoodResidenceMembers()

  $scope.uploadProof = (file, prefType) ->
    ShortFormApplicationService.uploadProof(file, prefType)

  $scope.hasPreferenceFile = (fileType) ->
    ShortFormApplicationService.hasPreferenceFile(fileType)

  $scope.deletePreferenceFile = (prefType) ->
    ShortFormApplicationService.deletePreferenceFile(prefType)

  $scope.preferenceFileError = (fileType) ->
    ShortFormApplicationService.preferenceFileError(fileType)

  $scope.preferenceFileIsLoading = (fileType) ->
    ShortFormApplicationService.preferenceFileIsLoading(fileType)

  ###### Household Section ########
  $scope.getHouseholdMember = ->
    # we just edit a copy, and then put it back in place after saving in addHouseholdMember
    $scope.householdMember = angular.copy(ShortFormApplicationService.householdMember)

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

  $scope.validateHouseholdEligibility = (match) ->
    $scope.clearHouseholdErrorMessage()
    form = $scope.form.applicationForm
    # skip the check if we're doing an incomeMatch and the applicant has vouchers
    if match == 'incomeMatch' && $scope.application.householdVouchersSubsidies == 'Yes'
      page = ShortFormNavigationService.getLandingPage({name: 'Review'}, $scope.application)
      return $state.go("dahlia.short-form-application.#{page}")
    ShortFormApplicationService.checkHouseholdEligiblity($scope.listing)
      .then( (response) ->
        $scope._respondToHouseholdEligibilityResults(response, match)
      )

  $scope._respondToHouseholdEligibilityResults = (response, match) ->
    eligibility = response.data
    if eligibility[match]
      $scope.householdEligibilityErrorMessage = null
      if match == 'incomeMatch'
        page = ShortFormNavigationService.getLandingPage({name: 'Review'}, $scope.application)
        $state.go("dahlia.short-form-application.#{page}")
      else
        $state.go('dahlia.short-form-application.status-programs')
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
      ShortFormApplicationService.invalidateHouseholdForm()
    else if error == 'too small'
      message = $translate.instant("ERROR.HOUSEHOLD_TOO_SMALL")
      ShortFormApplicationService.invalidateHouseholdForm()
    else if error == 'too low'
      message = $translate.instant("ERROR.HOUSEHOLD_INCOME_TOO_LOW")
      ShortFormApplicationService.invalidateIncomeForm()
    else if error == 'too high'
      message = $translate.instant("ERROR.HOUSEHOLD_INCOME_TOO_HIGH")
      ShortFormApplicationService.invalidateIncomeForm()
    $scope.householdEligibilityErrorMessage = message

  $scope.invalidateIncomeForm = ->
    ShortFormApplicationService.invalidateIncomeForm()

  $scope.checkSurveyComplete = ->
    ShortFormApplicationService.checkSurveyComplete()

  ## helpers
  $scope.alternateContactRelationship = ->
    ShortFormHelperService.alternateContactRelationship($scope.alternateContact)

  $scope.returnLanguage = (person) ->
    ShortFormHelperService.returnLanguage(person)

  $scope.applicationVouchersSubsidies = ->
    ShortFormHelperService.applicationVouchersSubsidies($scope.application)

  $scope.applicationIncomeAmount = ->
    ShortFormHelperService.applicationIncomeAmount($scope.application)

  ## translation helpers
  $scope.applicantFirstName = ->
    ShortFormHelperService.applicantFirstName($scope.applicant)

  $scope.householdMemberForPreference = (pref_type) ->
    ShortFormHelperService.householdMemberForPreference($scope.application, pref_type)

  $scope.submitApplication = ->
    ShortFormApplicationService.submitApplication($scope.listing.Id)
      .then( (response) ->
        # console.log(response, 'success submit')
        if response.data.lotteryNumber
          $scope.application.lotteryNumber = response.data.lotteryNumber
          $state.go('dahlia.short-form-application.confirmation')
        else
      )

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
    $state.go('dahlia.listing', {timeout: true, id: $scope.listing.Id})

  $scope.$on '$stateChangeError', (e, toState, toParams, fromState, fromParams, error) ->
    # capture errors when trying to verify address and send them back to the appropriate page
    f = ShortFormApplicationService.form.applicationForm
    f.$submitted = true
    f.$invalid = true
    f.$valid = false
    if toState.name == 'dahlia.short-form-application.verify-address'
      e.preventDefault()
      return $state.go('dahlia.short-form-application.contact', toParams)
    else if toState.name == 'dahlia.short-form-application.household-member-verify-address'
      e.preventDefault()
      return $state.go('dahlia.short-form-application.household-member-form-edit', toParams)


ShortFormApplicationController.$inject = [
  '$scope', '$state', '$window', '$document', '$translate', 'Idle',
  'ListingService', 'ShortFormApplicationService', 'ShortFormNavigationService', 'ShortFormHelperService', 'AddressValidationService'
]

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
