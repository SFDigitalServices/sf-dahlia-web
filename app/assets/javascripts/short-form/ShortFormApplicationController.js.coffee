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
  ShortFormApplicationService,
  ShortFormNavigationService,
  ShortFormHelperService,
  FileUploadService,
  AddressValidationService,
  AccountService
) ->

  $scope.form = ShortFormApplicationService.form
  $scope.$state = $state
  $scope.application = ShortFormApplicationService.application
  $scope.accountApplication = ShortFormApplicationService.accountApplication
  $scope.chosenApplicationToKeep = null
  $scope.applicant = ShortFormApplicationService.applicant
  $scope.preferences = ShortFormApplicationService.preferences
  $scope.alternateContact = ShortFormApplicationService.alternateContact
  $scope.householdMember = ShortFormApplicationService.householdMember
  $scope.householdMembers = ShortFormApplicationService.householdMembers
  $scope.listing = ShortFormApplicationService.listing
  $scope.validated_mailing_address = AddressValidationService.validated_mailing_address
  $scope.validated_home_address = AddressValidationService.validated_home_address
  $scope.householdEligibilityErrorMessage = null

  ## form options
  $scope.alternate_contact_options = ShortFormHelperService.alternate_contact_options
  $scope.gender_options = [
    'Male',
    'Female',
    'Trans Male',
    'Trans Female',
    'Decline to state'
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
  $scope.hideMessage = false

  if ShortFormApplicationService.isShortFormPage($state.current) && !$window.jasmine
    # don't add this onbeforeunload inside of jasmine tests
    $window.addEventListener 'beforeunload', ShortFormApplicationService.onExit

  $scope.submitForm = ->
    form = $scope.form.applicationForm
    ShortFormNavigationService.isLoading(true)
    if form.$valid
      # reset page form state (i.e. reset error messages)
      form.$setPristine()
      $scope.handleFormSuccess()
    else
      $scope.handleErrorState()

  $scope.handleFormSuccess = ->
    options = ShortFormNavigationService.submitOptionsForCurrentPage()
    if options.callback
      options.callback.forEach (callback) ->
        $scope[callback](options.params) if $scope[callback]
    if options.path
      $state.go(options.path)

  $scope.handleErrorState = ->
    # show error alert
    $scope.hideAlert = false
    ShortFormNavigationService.isLoading(false)
    el = angular.element(document.getElementById('short-form-wrapper'))
    # uses duScroll aka 'angular-scroll' module
    topOffset = 0
    duration = 400 # animation speed in ms
    $document.scrollToElement(el, topOffset, duration)

  $scope.inputInvalid = (fieldName, identifier = '') ->
    form = $scope.form.applicationForm
    return false unless form
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
    return false unless $state.params.error
    validated = $scope["validated_#{identifier}"]
    return AddressValidationService.failedValidation(validated)

  $scope.checkContactRequirement = (contactType) ->
    !$scope.applicant[contactType] || $scope.requiredContactInformationMissing()

  $scope.requiredContactInformationMissing = ->
    $scope.applicant.noPhone && $scope.applicant.noAddress && $scope.applicant.noEmail

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

  $scope.validMailingAddress = ->
    ShortFormApplicationService.validMailingAddress()

  $scope.notRequired = ->
    return false

  $scope.unsetNoAddressAndCheckMailingAddress = ->
    # $scope.applicant.noAddress = false
    $scope.checkIfMailingAddressNeeded()

  $scope.checkIfMailingAddressNeeded = ->
    if $scope.applicant.noAddress && ShortFormApplicationService.validMailingAddress()
      $scope.applicant.noAddress = false
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
      $scope.goToHouseholdLandingPage()
    else
      if $scope.alternateContact.alternateContactType != 'Social Worker or Housing Counselor'
        $scope.alternateContact.agency = null
      $state.go('dahlia.short-form-application.alternate-contact-name')

  $scope.hasNav = ->
    ShortFormNavigationService.hasNav()

  $scope.hasBackButton = ->
    ShortFormNavigationService.hasBackButton()

  $scope.backPageState = ->
    ShortFormNavigationService.backPageState()

  $scope.homeAddressRequired = ->
    !($scope.applicant.noAddress || $scope.applicant.hasAltMailingAddress) || $scope.requiredContactInformationMissing()

  $scope.truth = ->
    # wrap true value in a function a la function(){return true;}
    # used by isRequired() in _address_form
    true

  $scope.getLandingPage = (section) ->
    ShortFormNavigationService.getLandingPage(section)

  $scope.goToHouseholdLandingPage = ->
    $state.go("dahlia.short-form-application.#{$scope.getHouseholdLandingPage()}")

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

  ###### Attachment File Uploads ########
  $scope.uploadProof = (file, prefType, docType) ->
    FileUploadService.uploadProof(file, prefType, docType, $scope.listing.Id)

  $scope.hasPreferenceFile = (fileType) ->
    FileUploadService.hasPreferenceFile(fileType)

  $scope.deletePreferenceFile = (prefType) ->
    FileUploadService.deletePreferenceFile(prefType, $scope.listing.Id)

  $scope.preferenceFileError = (fileType) ->
    FileUploadService.preferenceFileError(fileType)

  $scope.preferenceFileIsLoading = (fileType) ->
    FileUploadService.preferenceFileIsLoading(fileType)

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

  $scope.validateHouseholdEligibility = (match) ->
    $scope.clearHouseholdErrorMessage()
    form = $scope.form.applicationForm
    # skip the check if we're doing an incomeMatch and the applicant has vouchers
    if match == 'incomeMatch' && $scope.application.householdVouchersSubsidies == 'Yes'
      page = ShortFormNavigationService.getLandingPage({name: 'Review'})
      return $state.go("dahlia.short-form-application.#{page}")
    ShortFormApplicationService.checkHouseholdEligiblity($scope.listing)
      .then( (response) ->
        $scope._respondToHouseholdEligibilityResults(response, match)
      )

  $scope._respondToHouseholdEligibilityResults = (response, match) ->
    eligibility = response.data
    if eligibility[match]
      $scope.clearHouseholdErrorMessage()
      if match == 'incomeMatch'
        page = ShortFormNavigationService.getLandingPage({name: 'Review'})
        $state.go("dahlia.short-form-application.#{page}")
      else
        $state.go('dahlia.short-form-application.preferences-programs')
    else
      $scope._determineHouseholdErrorMessage(eligibility, 'householdEligibilityResult') if match == 'householdMatch'
      $scope._determineHouseholdErrorMessage(eligibility, 'incomeEligibilityResult') if match == 'incomeMatch'
      $scope.handleErrorState()

  $scope.clearHouseholdErrorMessage = () ->
    $scope.householdEligibilityErrorMessage = null

  $scope._determineHouseholdErrorMessage= (eligibility, errorResult) ->
    error = eligibility[errorResult].toLowerCase()
    if errorResult == 'householdEligibilityResult'
      message = $translate.instant("ERROR.NOT_ELIGIBLE_HOUSEHOLD") + ' '
    else
      message = $translate.instant("ERROR.NOT_ELIGIBLE_INCOME") + ' '
    if error == 'too big'
      message += $translate.instant("ERROR.HOUSEHOLD_TOO_BIG")
      ShortFormApplicationService.invalidateHouseholdForm()
    else if error == 'too small'
      message += $translate.instant("ERROR.HOUSEHOLD_TOO_SMALL")
      ShortFormApplicationService.invalidateHouseholdForm()
    else if error == 'too low'
      message += $translate.instant("ERROR.HOUSEHOLD_INCOME_TOO_LOW")
      ShortFormApplicationService.invalidateIncomeForm()
    else if error == 'too high'
      message += $translate.instant("ERROR.HOUSEHOLD_INCOME_TOO_HIGH")
      ShortFormApplicationService.invalidateIncomeForm()
    else if errorResult == 'incomeEligibilityResult'
      # default state, this shouldn't happen but it seems to if income == 0
      message += $translate.instant("ERROR.HOUSEHOLD_INCOME_TOO_LOW")
      ShortFormApplicationService.invalidateIncomeForm()
    $scope.householdEligibilityErrorMessage = message

  $scope.visitResourcesLink = ->
    linkText = $translate.instant('LABEL.VISIT_ADDITIONAL_RESOURCES')
    link = $state.href('dahlia.additional-resources')
    {visitResourcesLink: "<a href='#{link}'>#{linkText}</a>"}

  $scope.invalidateIncomeForm = ->
    ShortFormApplicationService.invalidateIncomeForm()

  $scope.checkSurveyComplete = ->
    ShortFormApplicationService.checkSurveyComplete()

  ## helpers
  $scope.alternateContactRelationship = ->
    ShortFormHelperService.alternateContactRelationship($scope.alternateContact)

  $scope.applicationVouchersSubsidies = ->
    ShortFormHelperService.applicationVouchersSubsidies($scope.application)

  $scope.applicationIncomeAmount = ->
    ShortFormHelperService.applicationIncomeAmount($scope.application)

  $scope.translateLoggedInMessage = (page) ->
    ShortFormHelperService.translateLoggedInMessage(page)

  $scope.applicantFullName = (applicant) ->
    if (!applicant || !applicant.firstName || !applicant.lastName)
      return "No name entered"
    else
      "#{applicant.firstName} #{applicant.lastName}"

  $scope.chooseDraft = ->
    if ($scope.chosenApplicationToKeep == 'recent')
      user = AccountService.loggedInUser
      ShortFormApplicationService.keepCurrentDraftApplication(user).then( ->
        $state.go('dahlia.my-applications', {skipConfirm: true})
      )
    else
      $state.go('dahlia.my-applications', {skipConfirm: true})


  ## account service
  $scope.loggedIn = ->
    AccountService.loggedIn()

  ## translation helpers
  $scope.preferenceProofOptions = (pref_type) ->
    if pref_type == 'workInSf'
      ShortFormHelperService.preference_proof_options_work
    else
      ShortFormHelperService.preference_proof_options_default

  $scope.applicantFirstName = ->
    ShortFormHelperService.applicantFirstName($scope.applicant)

  $scope.householdMemberForPreference = (pref_type) ->
    ShortFormHelperService.householdMemberForPreference($scope.application, pref_type)

  $scope.fileAttachmentForPreference = (pref_type) ->
    ShortFormHelperService.fileAttachmentForPreference($scope.application, pref_type)

  $scope.isLoading = ->
    ShortFormNavigationService.isLoading()

  $scope.submitApplication = ->
    ShortFormNavigationService.isLoading(true)
    ShortFormApplicationService.submitApplication({finish: true})
      .then(  ->
        ShortFormNavigationService.isLoading(false)
        $state.go('dahlia.short-form-application.confirmation')
      )

  ## Save and finish later
  $scope.saveAndFinishLater = (ev) ->
    # prevent normal short form page submit
    ev.preventDefault()
    if AccountService.loggedIn()
      ShortFormApplicationService.submitApplication().then((response) ->
        $state.go('dahlia.my-applications', {skipConfirm: true})
      )
    else
      $state.go('dahlia.short-form-application.create-account')

  $scope.print = -> $window.print()

  $scope.$on '$stateChangeError', (e, toState, toParams, fromState, fromParams, error) ->
    # capture errors when trying to verify address and send them back to the appropriate page
    params = angular.copy(toParams)
    params.error = true
    $scope.handleErrorState()
    if toState.name == 'dahlia.short-form-application.verify-address'
      e.preventDefault()
      return $state.go('dahlia.short-form-application.contact', params)
    else if toState.name == 'dahlia.short-form-application.household-member-verify-address'
      e.preventDefault()
      return $state.go('dahlia.short-form-application.household-member-form-edit', params)

  $scope.$on '$stateChangeSuccess', (e, toState, toParams, fromState, fromParams) ->
    $scope.handleErrorState() if $state.params.error
    ShortFormNavigationService.isLoading(false)

ShortFormApplicationController.$inject = [
  '$scope', '$state', '$window', '$document', '$translate', 'Idle',
  'ShortFormApplicationService', 'ShortFormNavigationService',
  'ShortFormHelperService', 'FileUploadService',
  'AddressValidationService',
  'AccountService'
]

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
