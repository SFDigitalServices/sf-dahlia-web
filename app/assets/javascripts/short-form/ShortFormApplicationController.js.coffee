############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShortFormApplicationController = (
  $document,
  $scope,
  $state,
  $translate,
  $window,
  AccountService,
  AddressValidationService,
  AnalyticsService,
  Idle,
  inputMaxLength,
  ListingDataService,
  ListingIdentityService,
  RentBurdenFileService,
  SharedService,
  ShortFormApplicationService,
  ShortFormHelperService,
  ShortFormNavigationService
) ->

  $scope.form = ShortFormApplicationService.form
  $scope.$state = $state
  $scope.application = ShortFormApplicationService.application
  $scope.accountApplication = ShortFormApplicationService.accountApplication
  $scope.chosenApplicationToKeep = null
  $scope.applicant = ShortFormApplicationService.applicant
  $scope.preferences = ShortFormApplicationService.preferences
  $scope.preferenceMap = ListingDataService.preferenceMap
  $scope.alternateContact = ShortFormApplicationService.alternateContact
  $scope.currentCustomProofPreference = ShortFormApplicationService.currentCustomProofPreference
  $scope.householdMember = ShortFormApplicationService.householdMember
  $scope.householdMembers = ShortFormApplicationService.householdMembers
  $scope.householdIncome = ShortFormApplicationService.application.householdIncome
  $scope.listing = ShortFormApplicationService.listing
  $scope.currentRentBurdenAddress = ShortFormApplicationService.currentRentBurdenAddress
  $scope.validated_mailing_address = AddressValidationService.validated_mailing_address
  $scope.validated_home_address = AddressValidationService.validated_home_address
  $scope.notEligibleErrorMessage = $translate.instant('error.not_eligible')
  $scope.eligibilityErrors = ShortFormApplicationService.eligibilityErrors
  $scope.communityEligibilityErrorMsg = []
  $scope.latinRegex = ShortFormApplicationService.latinRegex
  # read more toggler
  $scope.readMoreDevelopmentalDisabilities = false
  # store label values that get overwritten by child directives
  $scope.labels = {}
  $scope.customInvalidMessage = null
  $scope.INPUT_MAX_LENGTH = inputMaxLength
  # community screening

  ## form options
  $scope.alternate_contact_options = ShortFormHelperService.alternate_contact_options
  $scope.priority_options = ShortFormHelperService.priority_options
  $scope.gender_options = ShortFormHelperService.gender_options
  $scope.primary_language_options = ShortFormHelperService.primary_language_options
  $scope.relationship_options = ShortFormHelperService.relationship_options
  $scope.race_and_ethnicity_options = ShortFormHelperService.race_and_ethnicity_options
  $scope.sexual_orientation_options = ShortFormHelperService.sexual_orientation_options
  $scope.listing_referral_options = ShortFormHelperService.listing_referral_options

  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false
  $scope.hideMessage = false
  $scope.addressError = ShortFormApplicationService.addressError
  # Account / Login
  $scope.loggedInUser = AccountService.loggedInUser
  $scope.userAuth = AccountService.userAuth
  $scope.accountError = AccountService.accountError
  $scope.accountSuccess = AccountService.accountSuccess
  $scope.rememberedShortFormState = AccountService.rememberedShortFormState
  $scope.submitDisabled = false

  $scope.emailRegex = SharedService.emailRegex

  $scope.propertyCardImageURL = ->
    if _.isArray($scope.listing.Listing_Images)
      return $scope.listing.Listing_Images[0].displayImageURL
    else
      return $scope.listing.imageURL

  $scope.startAutofilledApp = ->
    AnalyticsService.trackFormSuccess('Application', 'Start with these details')
    $scope.go(ShortFormNavigationService.initialState())

  $scope.trackContinuePreviousDraft = ->
    AnalyticsService.trackFormSuccess('Application', 'Continue with these details')

  $scope.resetAndStartNewApp = ->
    # always pull answeredCommunityScreening from the current session since that Q is answered first
    data =
      # will be null if the listing didn't have a screening Q
      answeredCommunityScreening: $scope.application.answeredCommunityScreening
      customEducatorScreeningAnswer: $scope.application.customEducatorScreeningAnswer
      customEducatorJobClassificationNumber: $scope.application.customEducatorJobClassificationNumber
    ShortFormApplicationService.resetApplicationData(data)
    $scope.applicant = ShortFormApplicationService.applicant
    $scope.preferences = ShortFormApplicationService.preferences
    $scope.alternateContact = ShortFormApplicationService.alternateContact
    $scope.householdMember = ShortFormApplicationService.householdMember
    $scope.householdMembers = ShortFormApplicationService.householdMembers
    delete $scope.application.autofill
    AnalyticsService.trackFormSuccess('Application', 'Reset and start from scratch')
    $state.go(ShortFormNavigationService.initialState())

  $scope.resetAndReplaceApp = ShortFormApplicationService.resetAndReplaceApp

  $scope.atShortFormState = ->
    ShortFormApplicationService.isShortFormPage($state.current)

  if $scope.atShortFormState() && !$window.jasmine && !window.protractor
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

  # TODO: Refactor the way we handle post-submit actions for short form pages
  # so that this handleFormSuccess function is not so closely coupled to the
  # submitOptionsForCurrentPage and submitActions functions in the
  # ShortFormNavigationService.
  #
  # Right now, submitOptionsForCurrentPage returns an object whose keys are
  # the short form page slugs and whose values are objects that can contain
  # three types of values:
  #  - path: a string state name to go to
  #  - callbacks: an array of functions to call
  #  - scopedCallbacks: an array of objects of the format:
  #    - func: a string function name
  #    - param: a param to be passed to the function named in func
  # The function names in scopedCallbacks are meant to be called on the scope of
  # the ShortFormApplicationController. We very much do not want to maintain this
  # paradigm! But at the moment we don't have time to refactor how this works. We
  # plan in the future to refactor the entire way the short form application is
  # set up and the way navigation works between pages, so this paradigm will
  # definitely be removed and replaced at that time.
  $scope.handleFormSuccess = ->
    options = ShortFormNavigationService.submitOptionsForCurrentPage()
    if options.callbacks
      options.callbacks.forEach (callback) ->
        callback()
    if options.scopedCallbacks
      options.scopedCallbacks.forEach (scopedCallback) ->
        $scope[scopedCallback.func](scopedCallback.param) if $scope[scopedCallback.func]
    if options.path
      ShortFormNavigationService.goToApplicationPage(options.path)

  $scope.go = (path, params) ->
    # go to a page without the Form Success analytics tracking
    if params
      $state.go(path, params)
    else
      $state.go(path)

  # called on stateChangeSuccess
  $scope.clearErrors = ->
    $scope.addressError = false
    $scope.clearRentBurdenError()
    $scope.clearEligibilityErrors()
    form = $scope.form.applicationForm
    form.$setPristine() if form

  $scope.handleErrorState = ->
    # show error alert
    $scope.hideAlert = false
    ShortFormNavigationService.isLoading(false)
    el = angular.element(document.getElementById('short-form-alerts'))
    if el.length
      # uses duScroll aka 'angular-scroll' module
      topOffset = 0
      duration = 400 # animation speed in ms
      $document.scrollToElement(el, topOffset, duration)

  $scope.currentForm = ->
    # pick up which ever one is defined (the other will be undefined)
    $scope.form.signIn ||
    $scope.form.applicationForm

  $scope.inputInvalid = (fieldName) ->
    form = $scope.currentForm()
    ShortFormApplicationService.inputInvalid(fieldName, form)

  $scope.inputInvalidOnTouched = (fieldName) ->
    form = $scope.currentForm()
    ShortFormApplicationService.inputInvalidOnTouched(fieldName, form)

  # uncheck the "no" option e.g. noPhone or noEmail if you're filling out a valid value
  $scope.uncheckNoOption = (fieldName) ->
    return if !$scope.applicant[fieldName] || $scope.inputValid(fieldName)
    # e.g. "phone" --> "noPhone"
    fieldToDisable = "no#{fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}"
    $scope.applicant[fieldToDisable] = false

  $scope.beginApplication = (lang = 'en') ->
    if $scope.isCustomEducatorListing()
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-welcome.custom-educator-screening', {lang: lang})
    else if $scope.listing.Reserved_community_type
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-welcome.community-screening', {lang: lang})
    else
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-welcome.overview', {lang: lang})

  $scope.onCommunityScreeningPage = ->
    $state.current.name == 'dahlia.short-form-welcome.community-screening' ||
    $state.current.name == 'dahlia.short-form-welcome.custom-educator-screening'

  $scope.checkCommunityScreening = ->
    # ng-change action for answering 'Yes' to screening
    $scope.eligibilityErrors = []

  $scope.validateCommunityEligibility = ->
    $scope.eligibilityErrors = []
    if $scope.application.answeredCommunityScreening == 'No'
      $scope.eligibilityErrors = $scope.communityEligibilityErrorMsg
      $scope.handleErrorState()
    else if $scope.application.answeredCommunityScreening ==  'Yes'
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-welcome.overview')

  ########## BEGIN CUSTOM EDUCATOR SCREENING LOGIC ##########

  # reserved for educators
  $scope.customEducatorIsListing1 = ->
    $scope.listing.Custom_Listing_Type == 'Educator 1: SFUSD employees only'

  # anyone can apply
  $scope.customEducatorIsListing2 = ->
    $scope.listing.Custom_Listing_Type == 'Educator 2: SFUSD employees & public'

  # waitlist only
  $scope.customEducatorIsListing3 = ->
    $scope.listing.Custom_Listing_Type == 'Educator 3: Waitlist - SFUSD employees & public'

  $scope.isCustomEducatorListing = ->
    $scope.customEducatorIsListing1() || $scope.customEducatorIsListing2() || $scope.customEducatorIsListing3()

  $scope.customEducatorIsEducator = ->
    $scope.application.customEducatorScreeningAnswer == 'Yes'

  $scope.customEducatorIsNotEducator = ->
    $scope.application.customEducatorScreeningAnswer == 'No'

  $scope.customEducatorCheckScreening = ->
    $scope.clearEligibilityErrors()

  $scope.customEducatorCapitalizeJobClassifcationNumber = ->
    form = $scope.form.applicationForm
    form['customEducatorJobClassificationNumber'].$setViewValue(
      form['customEducatorJobClassificationNumber'].$viewValue.toUpperCase()
    )

  $scope.customEducatorValidJobClassificationNumber = (value) ->
    _.includes(
      ShortFormHelperService.customEducatorValidJobClassificationNumbers,
      (value || '').toUpperCase()
    )

  $scope.customEducatorValidateEligibility = ->
    if $scope.customEducatorIsListing1() && $scope.customEducatorIsEducator()
      $scope.clearEligibilityErrors()
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-welcome.overview')
    else if $scope.customEducatorIsListing1() && $scope.customEducatorIsNotEducator()
      $scope.eligibilityErrors = [$translate.instant('a3_custom_educator_screening.you_must_work_at')]
      $scope.notEligibleErrorMessage = $translate.instant('a3_custom_educator_screening.you_are_not_eligible')
      $scope.handleErrorState()
    else if $scope.customEducatorIsListing2() || $scope.customEducatorIsListing3()
      $scope.clearEligibilityErrors()
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-welcome.overview')

  ########## END CUSTOM SCREENING LOGIC ##########

  $scope.addressInputInvalid = (identifier = '') ->
    return true if $scope.addressValidationError(identifier)
    $scope.inputInvalid('address1', identifier) ||
    $scope.inputInvalid('city', identifier) ||
    $scope.inputInvalid('state', identifier) ||
    $scope.inputInvalid('zip', identifier)

  $scope.addressValidationError = (identifier = '') ->
    return false unless $scope.addressError
    validated = $scope["validated_#{identifier}"]
    return AddressValidationService.validationError(validated)

  $scope.inputValid = (fieldName, formName = 'applicationForm') ->
    form = $scope.form.applicationForm
    field = form[fieldName]
    field.$valid if form && field

  $scope.blankIfInvalid = (fieldName) ->
    form = $scope.form.applicationForm
    if typeof form[fieldName] != 'undefined'
      $scope.applicant[fieldName] = '' if form[fieldName].$invalid

  $scope.noPrioritiesSelected = ->
    selected = $scope.application.adaPrioritiesSelected
    !_.some([selected['Mobility impairments'], selected['Vision impairments'], selected['Hearing impairments'], selected.None])

  $scope.clearPriorityOptions = ->
    selected = $scope.application.adaPrioritiesSelected
    _.map selected, (val, k) ->
      selected[k] = false unless k == 'None'

  $scope.clearPriorityNoOption = ->
    $scope.application.adaPrioritiesSelected.None = false

  $scope.priorityNoSelected = ->
    $scope.application.adaPrioritiesSelected.None

  $scope.clearPhoneData = (type) ->
    ShortFormApplicationService.clearPhoneData(type)

  $scope.validMailingAddress = ->
    ShortFormApplicationService.validMailingAddress()

  $scope.notRequired = ->
    return false

  $scope.addressChange = (model) ->
    member = $scope[model]
    # invalidate preferenceAddressMatch to ensure that they re-confirm address
    member.preferenceAddressMatch = null
    if member == $scope.applicant
      $scope.copyHomeToMailingAddress()
      ShortFormApplicationService.invalidateContactForm()
    if ShortFormApplicationService.eligibleForRentBurden()
      # make sure they step back through the household section to update groupedHouseholdAddresses + rents
      ShortFormApplicationService.invalidateHouseholdForm()

  $scope.copyHomeToMailingAddress = ->
    ShortFormApplicationService.copyHomeToMailingAddress()

  $scope.resetHomeAddress = ->
    #reset home address
    $scope.applicant.home_address = {}

  $scope.resetHouseholdMemberAddress = ->
    $scope.householdMember.home_address = {}

  $scope.resetAndCheckMailingAddress = ->
    #reset mailing address
    $scope.applicant.mailing_address = {}
    $scope.copyHomeToMailingAddress()

  $scope.checkIfAddressVerificationNeeded = ->
    if !_.isNil($scope.applicant.preferenceAddressMatch) && $scope.application.validatedForms.You['verify-address'] != false
      # skip ahead if their current address has already been confirmed.
      # $scope.applicant.preferenceAddressMatch is 'Matched', 'Not Matched',
      # or '' if address already confirmed, or is null if not already confirmed
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.alternate-contact-type')
    else
      # validate + geocode address, but kick out if we have errors
      ShortFormApplicationService.validateApplicantAddress( ->
        ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.verify-address')
      ).error( ->
        $scope.addressError = true
        $scope.handleErrorState()
      )

  $scope.checkIfAlternateContactInfoNeeded = ->
    if $scope.alternateContact.alternateContactType == 'None'
      ShortFormApplicationService.clearAlternateContactDetails()
      # skip ahead if they aren't filling out an alt. contact
      ShortFormNavigationService.goToSection('Household')
    else
      if $scope.alternateContact.alternateContactType != 'Social Worker or Housing Counselor'
        $scope.alternateContact.agency = null
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.alternate-contact-name')

  $scope.hasNav = ->
    ShortFormNavigationService.hasNav()

  $scope.hasBackButton = ->
    ShortFormNavigationService.hasBackButton()

  $scope.backPageState = ->
    ShortFormNavigationService.backPageState()

  $scope.getStartOfSection = (section) ->
    ShortFormNavigationService.getStartOfSection(section)

  ###### Proof of Preferences Logic ########
  # this is called after e0-preferences-intro
  $scope.checkIfPreferencesApply = ->
    if ShortFormApplicationService.eligibleForAssistedHousing()
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.assisted-housing-preference')
    else if ShortFormApplicationService.eligibleForRentBurden()
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.rent-burdened-preference')
    else
      $scope.checkForNeighborhoodOrLiveWork()

  $scope.checkForNeighborhoodOrLiveWork = ->
    if ShortFormApplicationService.eligibleForNRHP()
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.neighborhood-preference')
    else if ShortFormApplicationService.eligibleForADHP()
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.adhp-preference')
    else if ShortFormApplicationService.eligibleForLiveWork()
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.live-work-preference')
    else
      $scope.checkAfterLiveWork()

  $scope.checkAfterLiveInTheNeighborhood = (preference) ->
    # preference is either neighborhoodResidence or antiDisplacement
    if ShortFormApplicationService.applicationHasPreference(preference)
      # you already selected Neighborhood, so skip live/work
      $scope.checkAfterLiveWork()
    else
      # you opted out of Neighborhood, so go to live/work
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.live-work-preference')

  $scope.checkAfterLiveWork = ->
    if ShortFormApplicationService.listingHasRTRPreference()
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.right-to-return-preference')
    else
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.preferences-programs')

  ##### Custom Preferences Logic ####
  # this called after veterans-preference
  $scope.checkForCustomPreferences = ->
    if _.isEmpty($scope.listing.customPreferences)
      $scope.checkForCustomProofPreferences()
    else
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.custom-preferences')

  $scope.checkForCustomProofPreferences = ->
    nextIndex = null
    currentIndex = parseInt($state.params.prefIdx)

    if !_.isEmpty($scope.listing.customProofPreferences)
      if currentIndex >= 0 && currentIndex < $scope.listing.customProofPreferences.length - 1
        nextIndex = currentIndex + 1
      else if isNaN(currentIndex) && $scope.listing.customProofPreferences.length
        nextIndex = 0

    if nextIndex != null
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.custom-proof-preferences', {prefIdx: nextIndex})
    else
      $scope.checkIfNoPreferencesSelected()

  $scope.eligibleForAssistedHousingOrRentBurden = ->
    ShortFormApplicationService.eligibleForAssistedHousing() || ShortFormApplicationService.eligibleForRentBurden()

  # this is called after custom-preferences or preferences-programs
  $scope.checkIfNoPreferencesSelected = ->
    if ShortFormApplicationService.applicantHasNoPreferences()
      # only show general lottery notice if they have no preferences
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.general-lottery-notice')
    else
      # otherwise go to the Review section
      ShortFormNavigationService.goToSection('Review')

  $scope.checkPreferenceEligibility = (type = 'liveWorkInSf') ->
    # this mainly gets used as one of the submit callbacks for relevant pages in ShortFormNavigationService
    ShortFormApplicationService.refreshPreferences(type)

  $scope.preferenceWarning = ->
    return false unless $scope.form.currentPreferenceType
    if $scope.inputInvalid($scope.form.currentPreferenceType)
      return 'preferenceNotSelected'
    else if $scope.preferences[$scope.form.currentPreferenceType] &&
      $scope.form.applicationForm.$invalid &&
      $scope.form.applicationForm.$submitted
        return 'preferenceIncomplete'
    else
      false

  $scope.checkForRentBurdenFiles = ->
    if $scope.preferences.optOut.rentBurden || ShortFormApplicationService.hasCompleteRentBurdenFiles()
      $scope.checkForNeighborhoodOrLiveWork()
    else
      $scope.setRentBurdenError()
      $scope.handleErrorState()

  $scope.hasCompleteRentBurdenFilesForAddress = (address) ->
    ShortFormApplicationService.hasCompleteRentBurdenFilesForAddress(address)

  $scope.cancelRentBurdenFilesForAddress = (address) ->
    ShortFormNavigationService.isLoading(true)
    RentBurdenFileService.deleteRentBurdenPreferenceFiles($scope.listing.Id, address).then ->
      $scope.go('dahlia.short-form-application.rent-burdened-preference')

  $scope.setRentBurdenError = ->
    ShortFormApplicationService.invalidatePreferencesForm()
    $scope.customInvalidMessage = $translate.instant('e3b_rent_burden_preference.form_error')

  $scope.clearRentBurdenError = (message) ->
    $scope.customInvalidMessage = null

  $scope.liveInSfMembers = ->
    ShortFormApplicationService.liveInSfMembers()

  $scope.showPreference = (preference) ->
    ShortFormApplicationService.showPreference(preference)

  $scope.workInSfMembers = ->
    ShortFormApplicationService.workInSfMembers()

  $scope.liveInTheNeighborhoodAddresses = (opts = {}) ->
    addresses = []
    _.each ShortFormApplicationService.liveInTheNeighborhoodMembers(), (member) ->
      street = member.home_address.address1
      addresses.push(street) unless _.isNil(street)
    addresses = _.uniq(addresses)
    addresses = _.map(addresses, (x) -> "<strong>#{x}</strong>") if opts.strong
    addresses

  $scope.liveInTheNeighborhoodAddress = (opts = {}) ->
    # turn the list of addresses into a string
    $scope.liveInTheNeighborhoodAddresses(opts).join(' and ')

  $scope.cancelPreference = (preference) ->
    $scope.clearRentBurdenError() if preference == 'rentBurden'
    ShortFormApplicationService.cancelPreference(preference)

  $scope.cancelOptOut = (preference) ->
    ShortFormApplicationService.cancelOptOut(preference)

  $scope.preferenceRequired = (preference) ->
    return false unless $scope.showPreference(preference)
    ShortFormApplicationService.preferenceRequired(preference)

  ##### Right to return Preferences Logic ####
  $scope.getRTRPreferenceKey= ->
    ShortFormApplicationService.getRTRPreferenceKey($scope.listing)

  $scope.addressType = ->
    $scope.getRTRPreferenceKey() + '_address'

  $scope.rtrTranslationKeys = ->
    switch $scope.getRTRPreferenceKey()
      when 'rightToReturnSunnydale'
        return key =
          desc: $translate.instant("preferences.rtr_sunnydale.desc")
          title: $translate.instant("preferences.rtr_sunnydale.title")
          addressTitle: $translate.instant("preferences.rtr_sunnydale.address")
          addressDesc: $translate.instant("preferences.rtr_sunnydale.address_desc")
      when 'aliceGriffith'
        return key =
          desc: $translate.instant("preferences.alice_griffith.desc")
          title: $translate.instant("preferences.alice_griffith.title")
          addressTitle: $translate.instant("preferences.alice_griffith.address")
          addressDesc: $translate.instant("preferences.alice_griffith.address_desc")



  $scope.rtrInputInvalid = ->
    $scope.inputInvalid($scope.getRTRPreferenceKey())

  $scope.showRtrAddressForm = ->
    $scope.application.preferences[$scope.getRTRPreferenceKey()]

  $scope.checkAliceGriffithAddress = ->
    preferenceAddressVerified =
      $scope.application.aliceGriffith_address_verified &&
      $scope.application.validatedForms.Preferences['verify-alice-griffith-address'] != false
    if preferenceAddressVerified || !$scope.preferences.aliceGriffith
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.preferences-programs')
    else
      # Only validate the address if they have claimed alice griffith,
      # and it hasn't already been validated.
      AddressValidationService.validate {
        address: ShortFormApplicationService.preferences.aliceGriffith_address
        type: 'home'
      }
      .then ->
        $scope.application.aliceGriffith_address_verified = true
        ShortFormNavigationService.goToApplicationPage(
          'dahlia.short-form-application.alice-griffith-verify-address')
      .catch (error) ->
        $scope.application.aliceGriffith_address_verified = false
        # 422 is the status returned when the request was successful but
        # the address is invalid
        if error.status == 422
          $scope.addressError = true
          $scope.handleErrorState()
        else
          # continue application if address verification service errors so user isn't stuck
          ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.preferences-programs')

  ###### Household Section ########
  $scope.addHouseholdMember = ->
    noAddress = $scope.householdMember.hasSameAddressAsApplicant == 'Yes'
    if $scope.applicantDoesNotmeetAllSeniorBuildingRequirements('householdMember')
      ShortFormApplicationService.addSeniorEligibilityError()
      $scope.handleErrorState()
      return
    else
      $scope.clearEligibilityErrors()
    if noAddress || !_.isNil($scope.householdMember.preferenceAddressMatch)
      # addHouseholdMember and skip ahead if they aren't filling out an address
      # or their current address has already been confirmed
      ShortFormApplicationService.addHouseholdMember($scope.householdMember)
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.household-members')
    else
      # validate + geocode address, but kick out if we have errors
      ShortFormApplicationService.validateHouseholdMemberAddress( ->
        opts = {member_id: $scope.householdMember.id}
        ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.household-member-verify-address', opts)
      ).error( ->
        $scope.addressError = true
        $scope.handleErrorState()
      )

  $scope.cancelHouseholdMember = ->
    ShortFormApplicationService.cancelHouseholdMember()
    $scope.form.applicationForm.$setPristine()
    # go back to household members page without tracking Form Success
    $scope.go('dahlia.short-form-application.household-members')

  $scope.validateHouseholdEligibility = (match) ->
    $scope.clearEligibilityErrors()
    form = $scope.form.applicationForm

    if ShortFormApplicationService.householdDoesNotMeetAtLeastOneSeniorRequirement()
      age = { minAge: $scope.listing.Reserved_community_minimum_age }
      $scope.eligibilityErrors = [$translate.instant('error.senior_anyone', age)]
      $scope.handleErrorState()
      return

    # skip the check if we're doing an incomeMatch and the applicant has vouchers
    if match == 'incomeMatch' && $scope.application.householdVouchersSubsidies == 'Yes'
      ShortFormNavigationService.goToSection('Preferences')
      return

    ShortFormApplicationService.checkHouseholdEligibility($scope.listing)
      .then( (response) ->
        eligibility = response.data
        if match == 'householdMatch'
          error = eligibility.householdEligibilityResult.toLowerCase()
          $scope._respondToHouseholdEligibilityResults(eligibility, error)
        else if match == 'incomeMatch'
          error = eligibility.incomeEligibilityResult.toLowerCase()
          $scope._respondToIncomeEligibilityResults(eligibility, error)
      )

  $scope.clearEligibilityErrors = ->
    # JS trick to clear out the current array without re-assigning it
    # https://stackoverflow.com/a/1234337/260495
    $scope.eligibilityErrors.length = 0

  $scope._respondToHouseholdEligibilityResults = (eligibility, error) ->
    if eligibility.householdMatch
      # determine next page of household section
      if ShortFormApplicationService.hasHouseholdPublicHousingQuestion()
        ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.household-public-housing')
      else
        $scope.goToNextReservedPageIfAvailable()
    else
      $scope._determineHouseholdSizeEligibilityError(error)
      $scope.handleErrorState()

  $scope._respondToIncomeEligibilityResults = (eligibility, error) ->
    if eligibility.incomeMatch
      ShortFormNavigationService.goToSection('Preferences')
    else
      $scope._determineIncomeEligibilityErrors(error)
      $scope.handleErrorState()

  $scope._determineHouseholdSizeEligibilityError = (error) ->
    ShortFormApplicationService.invalidateHouseholdForm()
    # send household errors to analytics
    analyticsOpts =
      householdSize: ShortFormApplicationService.householdSize()
    AnalyticsService.trackFormError('Application', "household #{error}", analyticsOpts)
    # display household eligibility errors, there may be more than one so we `.push()`
    if error == 'too big'
      $scope.eligibilityErrors.push($translate.instant("error.household_too_big"))
    else if error == 'too small'
      $scope.eligibilityErrors.push($translate.instant("error.household_too_small"))

  $scope._determineIncomeEligibilityErrors = (error = 'too low') ->
    # error message from salesforce seems to be blank when income == 0, so default to 'too low'
    ShortFormApplicationService.invalidateIncomeForm()
    # send income errors to analytics
    analyticsOpts =
      householdSize: ShortFormApplicationService.householdSize()
      value: ShortFormApplicationService.calculateHouseholdIncome()
    AnalyticsService.trackFormError('Application', "income #{error}", analyticsOpts)
    # display income eligibility errors
    if error == 'too low'
      message = $translate.instant("error.household_income_too_low")
    else if error == 'too high'
      message = $translate.instant("error.household_income_too_high")
    $scope.eligibilityErrors = [message]

########## BEGIN VETERANS PREFERENCE LOGIC ##########

  $scope.eligibleVeteransMembers = ->
    ShortFormApplicationService.eligibleVeteransMembers()

  $scope.hasVeteranMemberYes = ->
    $scope.application.isAnyoneAVeteran == 'Yes'

  $scope.hasVeteranMemberDeclineToState = ->
    $scope.application.isAnyoneAVeteran == 'Decline to state'

  $scope.onChangeHasVeteranMember = ->
    if $scope.application.isAnyoneAVeteran != 'Yes'
      $scope.preferences.veterans_household_member = null

  $scope.checkAfterVeteransPreference = ->
    $scope.checkForCustomPreferences()


########## END VETERANS PREFERENCE LOGIC ##########

  $scope.checkIfPublicHousing = ->
    if $scope.application.hasPublicHousing == 'No'
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.household-monthly-rent')
    else
      $scope.goToNextReservedPageIfAvailable()

  # Check for need to ask about reserved units on the listing
  $scope.goToNextReservedPageIfAvailable = (type) ->
    page = ShortFormNavigationService.getNextReservedPageIfAvailable(type, 'next')
    ShortFormNavigationService.goToApplicationPage("dahlia.short-form-application.#{page}")

  # Go to income-vouchers or income based on what type of listing it is
  $scope.goToPostHouseholdPrioritiesPage = ->
    page = ShortFormNavigationService.getPostHouseholdPrioritiesPage($scope.listing)
    ShortFormNavigationService.goToApplicationPage("dahlia.short-form-application.#{page}")

  $scope.publicHousingYes = ->
    ShortFormApplicationService.resetMonthlyRentForm()
    # make sure they're forced through now that they have the assistedHousing option
    ShortFormApplicationService.invalidatePreferencesForm()
    ShortFormApplicationService.resetPreference('rentBurden')

  $scope.publicHousingNo = ->
    ShortFormApplicationService.invalidateMonthlyRentForm()
    ShortFormApplicationService.resetAssistedHousingForm()
    ShortFormApplicationService.resetPreference('assistedHousing')

  $scope.listingLink = ->
    linkText = $translate.instant('label.on_the_listing')
    link = $state.href('dahlia.listing', { id: $scope.listing.listingID })
    {listingLink: "<a href='#{link}'>#{linkText}</a>"}

  $scope.listingIsRental = ->
    ShortFormApplicationService.listingIsRental()

  $scope.listingIsSale = ->
    ShortFormApplicationService.listingIsSale()

  $scope.listingIsHabitat = ->
    ShortFormApplicationService.listingIsHabitat()

  $scope.onIncomeValueChange = ->
    ShortFormApplicationService.invalidateIncomeForm()
    return if !ShortFormApplicationService.listingHasPreference('rentBurden') ||
              ShortFormApplicationService.eligibleForRentBurden()
    ShortFormApplicationService.resetPreference('rentBurden')

  $scope.onMonthlyRentChange = ->
    return if !ShortFormApplicationService.listingHasPreference('rentBurden') ||
              ShortFormApplicationService.eligibleForRentBurden()
    ShortFormApplicationService.resetPreference('rentBurden')

  $scope.invalidateAltContactTypeForm = ->
    ShortFormApplicationService.invalidateAltContactTypeForm()

  $scope.alternateContactRelationship = ->
    ShortFormHelperService.alternateContactRelationship($scope.alternateContact)

  $scope.translateLoggedInMessage = (page) ->
    params =
      page: page
      infoChanged: ShortFormApplicationService.infoChanged
    ShortFormHelperService.translateLoggedInMessage(params)

  $scope.applicantFullName = (applicant) ->
    if (!applicant || !applicant.firstName || !applicant.lastName)
      return "No name entered"
    else
      "#{applicant.firstName} #{applicant.lastName}"

  $scope.chooseDraft = ->
    if ($scope.chosenApplicationToKeep == 'recent')
      user = AccountService.loggedInUser
      if ShortFormApplicationService.hasDifferentInfo($scope.applicant, user)
        ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.choose-applicant-details')
      else
        ShortFormApplicationService.keepCurrentDraftApplication(user).then( ->
          ShortFormNavigationService.goToApplicationPage('dahlia.my-applications', {skipConfirm: true})
        )
    else
      ShortFormNavigationService.goToApplicationPage('dahlia.my-applications', {skipConfirm: true})

  $scope.chooseApplicantDetails = ->
    if $scope.chosenAccountOption == 'createAccount'
      AccountService.signOut({ preserveAppData: true })

      # Return applicant to name page to review new account info
      ShortFormApplicationService.storeLastPage('name')
      ShortFormApplicationService.cancelPreferencesForMember($scope.applicant.id)
      ShortFormApplicationService.resetCompletedSections()
      ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.create-account')

    else if $scope.chosenAccountOption == 'continueAsGuest'
      AccountService.signOut({ preserveAppData: true })
      # when continuing anonymously, jump ahead to contact page rather than going back to the
      # name page so you don't see the welcome back page a second time
      lastPage = switch $scope.application.lastPage
        when 'name'
          'contact'
        else
          $scope.application.lastPage
      ShortFormNavigationService.goToApplicationPage("dahlia.short-form-application.#{lastPage}")

    else if $scope.chosenAccountOption == 'overwriteWithAccountInfo'
      ShortFormApplicationService.cancelPreferencesForMember($scope.applicant.id)
      ShortFormApplicationService.resetCompletedSections()
      # Import account details into recent draft and overwrite account application to
      # prevent a duplicate
      ShortFormApplicationService.keepCurrentDraftApplication(AccountService.loggedInUser).then ->
        ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.name')


  ## account service
  $scope.loggedIn = ->
    AccountService.loggedIn()

  $scope.accountExists = AccountService.shortFormAccountExists

  ## translation helpers
  $scope.preferenceProofOptions = (pref_type) ->
    ShortFormHelperService.proofOptions(pref_type)

  $scope.isLoading = ->
    ShortFormNavigationService.isLoading()

  $scope.submitApplication = ->
    ShortFormNavigationService.isLoading(true)
    ShortFormApplicationService.submitApplication({finish: true})
      .then(  ->
        ShortFormNavigationService.isLoading(false)
        ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.confirmation')
      ).catch( ->
        ShortFormNavigationService.isLoading(false)
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
        $scope.go('dahlia.my-applications', {skipConfirm: true})
      ).catch( ->
        ShortFormNavigationService.isLoading(false)
      )
    else
      ShortFormNavigationService.isLoading(false)
      # go to Create Account without tracking Form Success
      $scope.go('dahlia.short-form-application.create-account')

  # used for the welcome-back sign in
  $scope.signIn = ->
    form = $scope.form.signIn
    # have to manually set this because it's an ng-form
    form.$submitted = true
    if form.$valid
      $scope.submitDisabled = true
      # AccountService.userAuth will have been modified by form inputs
      ShortFormNavigationService.isLoading(true)
      AccountService.signIn().then( (success) ->
        $scope.submitDisabled = false
        if success
          form.$setUntouched()
          form.$setPristine()
          $scope.afterSignInWhileApplying()
      ).catch( ->
        $scope.handleErrorState()
        $scope.submitDisabled = false
      )
    else
      AnalyticsService.trackFormError('Application')
      $scope.handleErrorState()

  $scope.afterSignInWhileApplying = ->
    if (ShortFormApplicationService
        .applicantDoesNotmeetAllSeniorBuildingRequirements(AccountService.loggedInUser)
    )
      # log user out to either create account or continue anonymously
      AccountService.signOut({ preserveAppData: true })
      ShortFormApplicationService.addSeniorEligibilityError()
      return $state.go('dahlia.short-form-application.choose-applicant-details')

    $scope.getPrevAppData().then $scope.reconcilePreviousAppOrSubmit

  $scope.getPrevAppData = ->
    ShortFormApplicationService.getMyApplicationForListing(
      $scope.listing.Id, { forComparison: true }
    ).then (response) ->
      response.data
    .catch ->
      # Verify source of errors in https://www.pivotaltracker.com/story/show/159802520
      Raven.captureMessage('Error in getting previous app data (ShortFormApplicationController.getPrevAppData)', {
        level: 'error',
        extra: { sectionName: name, application: $scope.application }
      })
      alert($translate.instant('error.alert.bad_request'))
      $state.go('dahlia.short-form-application.name', { id: $scope.listing.Id })

  $scope.reconcilePreviousAppOrSubmit = (previousAppData) ->
    previousApp = previousAppData.application

    if (previousApp)
      # previous app submitted
      if $scope.appIsSubmitted(previousApp)
        doubleSubmit = !! $scope.appIsSubmitted($scope.application)
        return $state.go('dahlia.my-applications', {
          skipConfirm: true,
          alreadySubmittedId: previousApp.id,
          doubleSubmit: doubleSubmit
        })
      # previous app draft
      else if $state.current.name == 'dahlia.short-form-application.welcome-back'
        $scope.replaceAppWithPreviousDraft(previousAppData)
        return $state.go('dahlia.short-form-application.continue-previous-draft')
      else
        return $state.go('dahlia.short-form-application.choose-draft')

    # no previous draft, continue by saving application
    if $scope.appIsDraft($scope.application)
      # make sure short form data inherits logged in user data
      changed = ShortFormApplicationService.importUserData(AccountService.loggedInUser)
    else
      changed = null

    ShortFormApplicationService.submitApplication().then ->
      # I'm signing in on the welcome back page and continuing my application
      # Go back to name page to see account details
      if $state.current.name == 'dahlia.short-form-application.welcome-back'
        ShortFormNavigationService.goToApplicationPage(
          'dahlia.short-form-application.name', { infoChanged: changed }
        )

      # I'm signing in after submitting to save my application to my account
      else
        $state.go('dahlia.my-applications', { skipConfirm: true, infoChanged: changed })

  $scope.appIsSubmitted = (application) ->
    application.status.match(/submitted/i)

  $scope.appIsDraft = (application) ->
    application.status.match(/draft/i)

  $scope.replaceAppWithPreviousDraft = (previousAppData) ->
    # we store whatever they had for primaryApplicant as it's about to be overwritten
    overwrittenApplicantInfo = angular.copy($scope.applicant)
    # we also override their current "draft" since it's basically blank and to keep
    # ShortFormApplicationService.applicant and $scope.applicant, etc in sync
    ShortFormApplicationService.loadApplication(previousAppData)
    angular.copy(overwrittenApplicantInfo, $scope.application.overwrittenApplicantInfo)
    ShortFormApplicationService.resetCompletedSections()
    # set the Intro section to completed, because if the user chooses to continue
    # with their previous draft, we will send them onwards to the Contact page in
    # the You section, so we need to make sure the Intro section is marked complete
    # since the user will be past that section
    ShortFormApplicationService.completeSection('Intro')

  $scope.print = -> $window.print()

  $scope.checkAfterNamePage = ->
    if $scope.applicantDoesNotmeetAllSeniorBuildingRequirements()
      ShortFormNavigationService.isLoading(false)
      ShortFormApplicationService.addSeniorEligibilityError()
      $scope.handleErrorState()
    else
      if $scope.loggedIn()
        ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.contact')
      else
        ShortFormNavigationService.isLoading(true)
        AccountService.checkForAccount($scope.applicant.email).then ->
          if AccountService.accountExists
            ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.welcome-back')
          else
            ShortFormNavigationService.goToApplicationPage('dahlia.short-form-application.contact')

  $scope.DOBValid = (field, value, model = 'applicant') ->
    values = $scope.DOBValues(model)
    values[field] = parseInt(value)
    ShortFormApplicationService.DOBValid(field, values)

  $scope.DOBValues = (model = 'applicant') ->
    ShortFormApplicationService.DOBValues(model)

  $scope.primaryApplicantValidAge = ->
    age = $scope.memberAgeOnForm('applicant')
    return true unless age
    return false if $scope.primaryApplicantUnder18()
    return false if $scope.applicantDoesNotmeetAllSeniorBuildingRequirements()
    true

  $scope.applicantDOB_hasError = ->
    $scope.inputInvalid('date_of_birth_day') ||
    $scope.inputInvalid('date_of_birth_month') ||
    $scope.inputInvalid('date_of_birth_year') ||
    $scope.eligibilityErrors.length

  $scope.applicantDoesNotmeetAllSeniorBuildingRequirements = (member = 'applicant') ->
    ShortFormApplicationService.applicantDoesNotmeetAllSeniorBuildingRequirements(member)

  $scope.primaryApplicantUnder18 = ->
    $scope.memberAgeOnForm('applicant') < 18

  $scope.householdMemberUnder0 = ->
    dob = $scope.memberDOBMoment('householdMember')
    return false unless dob
    ageDays = moment().add(10, 'months').diff(dob, 'days')
    # HH member allowed to be 10 months "unborn"
    return ageDays < 0

  $scope.memberAgeOnForm = (member = 'applicant') ->
    ShortFormApplicationService.memberAgeOnForm(member)

  $scope.memberDOBMoment = (member = 'applicant') ->
    ShortFormApplicationService.memberDOBMoment(member)

  $scope.householdMemberValidAge = ->
    age = $scope.memberAgeOnForm('householdMember')
    return true unless age
    return false if $scope.householdMemberUnder0()
    return false if $scope.applicantDoesNotmeetAllSeniorBuildingRequirements('householdMember')
    true

  $scope.recheckDOB = (member) ->
    form = $scope.form.applicationForm
    day = form['date_of_birth_day']
    # have to "reset" the dob_day form input by setting it to its current value
    # which will auto-trigger its ui-validation
    day.$setViewValue(day.$viewValue + ' ')
    # also re-check year to see if age is valid (primary > 18, HH > "10 months in the future")
    year = form['date_of_birth_year']
    year.$setViewValue(year.$viewValue + ' ')
    if $scope.listing.Reserved_community_type == 'Senior'
      # make sure we re-check them at the Household section, in case they are no longer senior eligible
      ShortFormApplicationService.invalidateHouseholdForm()
    if (member == 'applicant' && $scope.primaryApplicantValidAge()) ||
      (member == 'householdMember' && $scope.householdMemberValidAge())
        $scope.clearEligibilityErrors()

  $scope.formattedBuildingAddress = (listing, display) ->
    ShortFormApplicationService.formattedBuildingAddress(listing, display)

  $scope.isLocked = (field) ->
    AccountService.lockedFields[field]

  $scope.today = ->
    moment().tz('America/Los_Angeles').format('YYYY-MM-DD')

  $scope.applicationCompletionPercentage = (application) ->
    ShortFormApplicationService.applicationCompletionPercentage(application)

  $scope.$on 'auth:login-error', (ev, reason) ->
    $scope.accountError.messages.user = $translate.instant('sign_in.bad_credentials')
    $scope.handleErrorState()

  $scope.$on '$stateChangeError', (e, toState, toParams, fromState, fromParams, error) ->
    # NOTE: not sure when this will ever really get hit any more
    #  used to be for address validation errors
    $scope.handleErrorState()

  # separate this method out for better unit testing
  $scope.onStateChangeSuccess = (e, toState, toParams, fromState, fromParams) ->
    unless toState.name == 'dahlia.short-form-application.choose-applicant-details'
      $scope.clearErrors()
    ShortFormNavigationService.isLoading(false)
    ShortFormApplicationService.setApplicationLanguage(toParams.lang)
    if ShortFormApplicationService.isEnteringShortForm(toState, fromState) &&
      ShortFormApplicationService.application.id
        ShortFormApplicationService.sendToLastPageofApp(toState)
    ShortFormApplicationService.storeLastPage(toState.name)

  $scope.$on '$stateChangeSuccess', $scope.onStateChangeSuccess

  $scope.stateChangeStart = (e, toState, toParams, fromState, fromParams) ->
    ShortFormApplicationService.setApplicationLanguage(toParams.lang)

  $scope.$on '$stateChangeStart', $scope.stateChangeStart

  $scope.isSale = (listing) ->
    ListingIdentityService.isSale(listing)

ShortFormApplicationController.$inject = [
  '$document',
  '$scope',
  '$state',
  '$translate',
  '$window',
  'AccountService',
  'AddressValidationService',
  'AnalyticsService',
  'Idle',
  'inputMaxLength',
  'ListingDataService',
  'ListingIdentityService',
  'RentBurdenFileService',
  'SharedService',
  'ShortFormApplicationService',
  'ShortFormHelperService',
  'ShortFormNavigationService'
]

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
