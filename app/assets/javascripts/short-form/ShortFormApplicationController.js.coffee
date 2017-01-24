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
  # Account / Login
  $scope.userAuth = AccountService.userAuth
  $scope.accountError = AccountService.accountError
  $scope.accountSuccess = AccountService.accountSuccess
  $scope.rememberedShortFormState = AccountService.rememberedShortFormState
  $scope.submitDisabled = false

  $scope.atShortFormState = ->
    ShortFormApplicationService.isShortFormPage($state.current)

  if $scope.atShortFormState() && !$window.jasmine
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
      $scope.trackFormErrors()
      $scope.handleErrorState()

  $scope.trackFormErrors = ->
    # track global form error
    AnalyticsService.trackFormError('Application')
    form = $scope.form.applicationForm
    fieldErrors = _.chain(form.$error).values().flatten().map('$name').uniq().value()
    fieldErrors.forEach (field) ->
      # track individual field errors
      AnalyticsService.trackFormFieldError('Application', field)

  $scope.handleFormSuccess = ->
    options = ShortFormNavigationService.submitOptionsForCurrentPage()
    if options.callback
      options.callback.forEach (callback) ->
        $scope[callback](options.params) if $scope[callback]
    if options.path
      $scope.goToAndTrackFormSuccess(options.path)

  $scope.goToAndTrackFormSuccess = (path, params) ->
    AnalyticsService.trackFormSuccess('Application')
    if params
      $state.go(path, params)
    else
      $state.go(path)

  $scope.goToAndLeaveForm = (path, params) ->
    # go to a page without the Form Success analytics tracking
    if params
      $state.go(path, params)
    else
      $state.go(path)


  $scope.handleErrorState = ->
    # show error alert
    $scope.hideAlert = false
    ShortFormNavigationService.isLoading(false)
    el = angular.element(document.getElementById('short-form-wrapper'))
    # uses duScroll aka 'angular-scroll' module
    topOffset = 0
    duration = 400 # animation speed in ms
    $document.scrollToElement(el, topOffset, duration)

  $scope.currentForm = ->
    # pick up which ever one is defined (the other will be undefined)
    $scope.form.signIn ||
    $scope.form.applicationForm

  $scope.inputInvalid = (fieldName, identifier = '') ->
    form = $scope.currentForm()
    return false unless form
    fieldName = if identifier then "#{identifier}_#{fieldName}" else fieldName
    field = form[fieldName]
    if form && field
      field.$invalid && (field.$touched || form.$submitted)
    else
      false

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
      $scope.goToAndTrackFormSuccess('dahlia.short-form-application.alternate-contact-type')
    else
      # validate + geocode address, but kick out if we have errors
      ShortFormApplicationService.validateApplicantAddress( ->
        $scope.goToAndTrackFormSuccess('dahlia.short-form-application.verify-address')
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
      $scope.goToAndTrackFormSuccess('dahlia.short-form-application.alternate-contact-name')

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
    $scope.goToAndTrackFormSuccess("dahlia.short-form-application.#{$scope.getHouseholdLandingPage()}")

  $scope.getHouseholdLandingPage = (section) ->
    $scope.getLandingPage({name: 'Household'})

  ###### Proof of Preferences Logic ########
  # this is called after d1-preferences-programs
  $scope.checkIfPreferencesApply = ->
    if ShortFormApplicationService.eligibleForLiveWorkOrNRHP()
      $scope.goToAndTrackFormSuccess('dahlia.short-form-application.live-work-preference')
    else
      $scope.checkIfNoPreferencesSelected()

  # this is called after d2-live-work-preference (and also inside of the above function)
  $scope.checkIfNoPreferencesSelected = ->
    if ShortFormApplicationService.applicantHasNoPreferences()
      # only show general lottery notice if they have no preferences
      $scope.goToAndTrackFormSuccess('dahlia.short-form-application.general-lottery-notice')
    else
      # otherwise go to the Income section
      $scope.goToAndTrackFormSuccess('dahlia.short-form-application.income-vouchers')

  $scope.applicantHasNoPreferences = ->
    ShortFormApplicationService.applicantHasNoPreferences()

  $scope.checkPreferenceEligibility = () ->
    ShortFormApplicationService.refreshPreferences()

  $scope.liveInSfMembers = ->
    ShortFormApplicationService.liveInSfMembers()

  $scope.showPreference = (preference) ->
    return false unless ListingService.hasPreference(preference)
    switch preference
      when 'liveWorkInSf'
        $scope.workInSfMembers().length > 0 && $scope.liveInSfMembers().length > 0
      when 'liveInSf'
        $scope.liveInSfMembers().length > 0 && $scope.workInSfMembers().length == 0
      when 'workInSf'
        $scope.workInSfMembers().length > 0 && $scope.liveInSfMembers().length == 0
      when 'neighborhoodResidence'
        $scope.neighborhoodResidenceMembers().length > 0
      else
        true

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
    noAddress = _.includes(['Yes', 'No Address'], $scope.householdMember.hasSameAddressAsApplicant)
    if noAddress || $scope.householdMember.neighborhoodPreferenceMatch
      # addHouseholdMember and skip ahead if they aren't filling out an address
      # or their current address has already been confirmed
      ShortFormApplicationService.addHouseholdMember($scope.householdMember)
      $scope.goToAndTrackFormSuccess('dahlia.short-form-application.household-members')
    else
      # validate + geocode address, but kick out if we have errors
      ShortFormApplicationService.validateHouseholdMemberAddress( ->
        opts = {member_id: $scope.householdMember.id}
        $scope.goToAndTrackFormSuccess('dahlia.short-form-application.household-member-verify-address', opts)
      ).error( ->
        $scope.addressError = true
        $scope.handleErrorState()
      )

  $scope.cancelHouseholdMember = ->
    ShortFormApplicationService.cancelHouseholdMember()
    $scope.form.applicationForm.$setPristine()
    # go back to household members page without tracking Form Success
    $scope.goToAndLeaveForm('dahlia.short-form-application.household-members')

  $scope.validateHouseholdEligibility = (match) ->
    $scope.clearHouseholdErrorMessage()
    form = $scope.form.applicationForm
    # skip the check if we're doing an incomeMatch and the applicant has vouchers
    if match == 'incomeMatch' && $scope.application.householdVouchersSubsidies == 'Yes'
      page = ShortFormNavigationService.getLandingPage({name: 'Review'})
      $scope.goToAndTrackFormSuccess("dahlia.short-form-application.#{page}")
      return
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
        $scope.goToAndTrackFormSuccess("dahlia.short-form-application.#{page}")
      else
        $scope.goToAndTrackFormSuccess('dahlia.short-form-application.preferences-programs')
    else
      $scope._determineHouseholdErrorMessage(eligibility, 'householdEligibilityResult') if match == 'householdMatch'
      $scope._determineHouseholdErrorMessage(eligibility, 'incomeEligibilityResult') if match == 'incomeMatch'
      $scope.handleErrorState()

  $scope.clearHouseholdErrorMessage = () ->
    $scope.householdEligibilityErrorMessage = null

  $scope._determineHouseholdErrorMessage= (eligibility, errorResult) ->
    error = eligibility[errorResult].toLowerCase()
    if errorResult == 'incomeEligibilityResult' && error == ''
      # error message from salesforce seems to be blank when income == 0
      error = 'too low'
    # determine if we're in a household or income error state
    if errorResult == 'householdEligibilityResult'
      analyticsOpts =
        householdSize: ShortFormApplicationService.householdSize()
      AnalyticsService.trackFormError('Application', "household #{error}", analyticsOpts)
      message = $translate.instant("ERROR.NOT_ELIGIBLE_HOUSEHOLD") + ' '
    else
      analyticsOpts =
        householdSize: ShortFormApplicationService.householdSize()
        value: ShortFormApplicationService.calculateHouseholdIncome()
      AnalyticsService.trackFormError('Application', "income #{error}", analyticsOpts)
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

  $scope.confirmReviewedApplication = ->
    if AccountService.loggedIn()
      $scope.goToAndTrackFormSuccess('dahlia.short-form-application.review-terms')
    else
      $scope.goToAndTrackFormSuccess('dahlia.short-form-application.review-sign-in')

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
        $scope.goToAndTrackFormSuccess('dahlia.my-applications', {skipConfirm: true})
      )
    else
      $scope.goToAndTrackFormSuccess('dahlia.my-applications', {skipConfirm: true})


  ## account service
  $scope.loggedIn = ->
    AccountService.loggedIn()

  ## translation helpers
  $scope.preferenceProofOptions = (pref_type) ->
    switch pref_type
      when 'workInSf'
        ShortFormHelperService.preference_proof_options_work
      when 'liveInSf'
        ShortFormHelperService.preference_proof_options_live
      when 'neighborhoodResidence'
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
        $scope.goToAndTrackFormSuccess('dahlia.short-form-application.confirmation')
      )

  ## Save and finish later
  $scope.saveAndFinishLater = (ev) ->
    # prevent normal short form page submit
    ev.preventDefault()
    ShortFormNavigationService.isLoading(true)
    if AccountService.loggedIn()
      ShortFormApplicationService.submitApplication().then((response) ->
        # ShortFormNavigationService.isLoading(false) will happen after My Apps are loaded
        # go to my applications without tracking Form Success
        $scope.goToAndLeaveForm('dahlia.my-applications', {skipConfirm: true})
      )
    else
      ShortFormNavigationService.isLoading(false)
      # go to Create Account without tracking Form Success
      $scope.goToAndLeaveForm('dahlia.short-form-application.create-account')

  $scope.print = -> $window.print()

  $scope.DOBValid = (field, value, model = 'applicant') ->
    values = $scope.DOBValues(model)
    values[field] = parseInt(value)
    ShortFormApplicationService.DOBValid(field, values)

  $scope.DOBValues = (model = 'applicant') ->
    {
      month: parseInt($scope[model].dob_month)
      day: parseInt($scope[model].dob_day)
      year: parseInt($scope[model].dob_year)
    }

  $scope.primaryApplicantUnder18 = ->
    values = $scope.DOBValues('applicant')
    form = $scope.form.applicationForm
    # have to grab viewValue because if the field is in error state the model will be undefined
    year = parseInt(form['date_of_birth_year'].$viewValue)
    return false unless values.month && values.day && year >= 1900
    dob = moment("#{year}-#{values.month}-#{values.day}", 'YYYY-MM-DD')
    age = moment().diff(dob, 'years')
    return true if age < 18

  $scope.recheckDOB = (member) ->
    form = $scope.form.applicationForm
    day = form['date_of_birth_day']
    # have to "reset" the dob_day form input by setting it to its current value
    # which will auto-trigger its ui-validation
    day.$setViewValue(day.$viewValue + ' ')
    if member == 'applicant'
      # also re-check year to see if primary applicant is over 18
      year = form['date_of_birth_year']
      year.$setViewValue(year.$viewValue + ' ')


  $scope.signIn = ->
    form = $scope.form.signIn
    # have to manually set this because it's an ng-form
    form.$submitted = true
    if form.$valid
      $scope.submitDisabled = true
      # AccountService.userAuth will have been modified by form inputs
      AccountService.signIn().then( (success) ->
        $scope.submitDisabled = false
        if success
          form.$setUntouched()
          form.$setPristine()
          # TODO: REMOVE AND REPLACE WITH ShortFormApplicationService.signInSubmitApplication
          # TODO: add "signed in successfully" to the top of the terms page
          $scope.goToAndTrackFormSuccess('dahlia.short-form-application.review-terms', {successMessage: 'hello'})
      ).catch( ->
        $scope.handleErrorState()
        $scope.submitDisabled = false
      )
    else
      AnalyticsService.trackFormError('Application')
      $scope.handleErrorState()

  $scope.$on '$stateChangeError', (e, toState, toParams, fromState, fromParams, error) ->
    # NOTE: not sure when this will ever really get hit any more
    #  used to be for address validation errors
    $scope.handleErrorState()

  $scope.$on '$stateChangeSuccess', (e, toState, toParams, fromState, fromParams) ->
    $scope.addressError = false
    ShortFormNavigationService.isLoading(false)

  # TODO: -- REMOVE HARDCODED FEATURES --
  $scope.listingIs = (name) ->
    ShortFormApplicationService.listingIs(name)

ShortFormApplicationController.$inject = [
  '$scope', '$state', '$window', '$document', '$translate', 'Idle', 'ListingService',
  'ShortFormApplicationService', 'ShortFormNavigationService',
  'ShortFormHelperService', 'FileUploadService',
  'AnalyticsService',
  'AddressValidationService',
  'AccountService'
]

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
