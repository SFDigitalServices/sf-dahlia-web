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
  AnalyticsService,
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
    'Not Listed'
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
  $scope.sexual_orientation_options = [
    'Straight/Heterosexual',
    'Gay',
    'Lesbian',
    'Bisexual',
    'Questioning/Unsure',
    'Not Listed'
  ]

  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false
  $scope.hideMessage = false
  $scope.addressError = ShortFormApplicationService.addressError

  $scope.atShortFormState = ->
    ShortFormApplicationService.isShortFormPage($state.current)

  if $scope.atShortFormState() && !$window.jasmine
    # don't add this onbeforeunload inside of jasmine tests
    $window.addEventListener 'beforeunload', ShortFormApplicationService.onExit

  $scope.submitForm = ->
    form = $scope.form.applicationForm
    ShortFormNavigationService.isLoading(true)
    if form.$valid
      AnalyticsService.trackFormSuccess('Application')

      # reset page form state (i.e. reset error messages)
      form.$setPristine()
      $scope.handleFormSuccess()
    else
      AnalyticsService.trackFormError('Application')
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

  # uncheck the "no" option e.g. noPhone or noEmail if you're filling out a valid value
  $scope.uncheckNoOption = (fieldName) ->
    return if !$scope.applicant[fieldName] || $scope.inputValid(fieldName)
    # e.g. "phone" --> "noPhone"
    fieldToDisable = "no#{fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}"
    $scope.applicant[fieldToDisable] = false

  $scope.addressInputInvalid = (identifier = '') ->
    if $scope.addressFailedValidation(identifier)
      return true
    $scope.inputInvalid('address1', identifier) ||
    $scope.inputInvalid('city', identifier) ||
    $scope.inputInvalid('state', identifier) ||
    $scope.inputInvalid('zip', identifier)

  $scope.addressFailedValidation = (identifier = '') ->
    return false unless $scope.addressError
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

  $scope.addressChange = (model) ->
    member = $scope[model]
    # invalidate neighborhoodPreferenceMatch to ensure that they re-confirm address
    member.neighborhoodPreferenceMatch = null
    if member == $scope.applicant
      $scope.checkIfMailingAddressNeeded()
      ShortFormApplicationService.invalidateContactForm()
    else
      ShortFormApplicationService.invalidateHouseholdForm()

  $scope.checkIfMailingAddressNeeded = ->
    if $scope.applicant.noAddress && ShortFormApplicationService.validMailingAddress()
      $scope.applicant.noAddress = false
    ShortFormApplicationService.copyHomeToMailingAddress()

  $scope.resetHomeAddress = ->
    #reset home address
    $scope.applicant.home_address = {}

  $scope.resetHouseholdMemberAddress = ->
    $scope.householdMember.home_address = {}

  $scope.copyApplicantAddressToHouseholdMember = ->
    $scope.householdMember.home_address = {}
    angular.copy($scope.applicant.home_address, $scope.householdMember.home_address)

  $scope.resetAndCheckMailingAddress = ->
    #reset mailing address
    $scope.applicant.mailing_address = {}
    $scope.checkIfMailingAddressNeeded()

  $scope.checkIfAddressVerificationNeeded = ->
    if $scope.applicant.noAddress || (
      $scope.applicant.neighborhoodPreferenceMatch &&
      $scope.application.validatedForms.You['verify-address'] != false
    )
      ###
      skip ahead if they aren't filling out an address
       or their current address has already been confirmed.
      $scope.applicant.neighborhoodPreferenceMatch doesn't have to == 'Matched',
       just that it has a value
      ###
      $state.go('dahlia.short-form-application.alternate-contact-type')
    else
      # validate + geocode address, but kick out if we have errors
      ShortFormApplicationService.validateApplicantAddress( ->
        $state.go('dahlia.short-form-application.verify-address')
      ).error( ->
        $scope.addressError = true
        $scope.handleErrorState()
      )


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

  $scope.checkPreferenceEligibility = () ->
    ShortFormApplicationService.refreshPreferences()

  $scope.liveInSfMembers = ->
    ShortFormApplicationService.liveInSfMembers()

  $scope.showPreference = (preference) ->
    switch preference
      when 'liveWorkInSf'
        $scope.workInSfMembers().length > 0 && $scope.liveInSfMembers().length > 0
      when 'liveInSf'
        $scope.liveInSfMembers().length > 0 && $scope.workInSfMembers().length == 0
      when 'workInSf'
        $scope.workInSfMembers().length > 0 && $scope.liveInSfMembers().length == 0
      when 'neighborhoodResidence'
        $scope.neighborhoodResidenceMembers().length > 0

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
  $scope.addHouseholdMember = ->
    if $scope.householdMember.hasSameAddressAsApplicant == 'Yes' ||
        $scope.householdMember.neighborhoodPreferenceMatch
      # addHouseholdMember and skip ahead if they aren't filling out an address
      # or their current address has already been confirmed
      ShortFormApplicationService.addHouseholdMember($scope.householdMember)
      $state.go('dahlia.short-form-application.household-members')
    else
      # validate + geocode address, but kick out if we have errors
      ShortFormApplicationService.validateHouseholdMemberAddress( ->
        $state.go('dahlia.short-form-application.household-member-verify-address', {member_id: $scope.householdMember.id})
      ).error( ->
        $scope.addressError = true
        $scope.handleErrorState()
      )

  $scope.cancelHouseholdMember = ->
    ShortFormApplicationService.cancelHouseholdMember()
    $scope.form.applicationForm.$setPristine()
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

  $scope.listingLink = ->
    linkText = $translate.instant('LABEL.ON_THE_LISTING')
    link = $state.href('dahlia.listing', { id: $scope.listing.listingID })
    {listingLink: "<a href='#{link}'>#{linkText}</a>"}

  $scope.invalidateIncomeForm = ->
    ShortFormApplicationService.invalidateIncomeForm()

  $scope.invalidateAltContactTypeForm = ->
    ShortFormApplicationService.invalidateAltContactTypeForm()

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
    else if pref_type == 'liveInSf'
      ShortFormHelperService.preference_proof_options_live
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


  $scope.maxDOBDay = (model = 'applicant') ->
    month = $scope[model].dob_month
    year = $scope[model].dob_year
    ShortFormApplicationService.maxDOBDay(month, year)

  $scope.$on '$stateChangeError', (e, toState, toParams, fromState, fromParams, error) ->
    # NOTE: not sure when this will ever really get hit any more
    #  used to be for address validation errors
    $scope.handleErrorState()

  $scope.$on '$stateChangeSuccess', (e, toState, toParams, fromState, fromParams) ->
    $scope.addressError = false
    ShortFormNavigationService.isLoading(false)

  # TODO: -- REMOVE HARDCODED FEATURES --
  $scope.listingIs = (name) ->
    ShortFormApplicationService.listingIs($scope.listing, name)

ShortFormApplicationController.$inject = [
  '$scope', '$state', '$window', '$document', '$translate', 'Idle',
  'ShortFormApplicationService', 'ShortFormNavigationService',
  'ShortFormHelperService', 'FileUploadService',
  'AnalyticsService',
  'AddressValidationService',
  'AccountService'
]

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
