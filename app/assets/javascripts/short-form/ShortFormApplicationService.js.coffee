ShortFormApplicationService = (
  $translate, $http, $state, $window, uuid,
  AddressValidationService,
  AnalyticsService,
  FileUploadService,
  GISService,
  ListingConstantsService,
  ListingDataService,
  ListingIdentityService,
  ListingPreferenceService,
  ListingUnitService,
  RentBurdenFileService,
  SharedService,
  ShortFormDataService
) ->
  Service = {}

  Service.refreshSessionUid = ->
    Service.session_uid = "#{uuid.v4()}-#{uuid.v4()}"
    Service.application.externalSessionId = Service.session_uid if Service.application

  Service.refreshSessionUid()

  Service.listing = ListingDataService.listing
  Service.reservedQuestion = ListingDataService.reservedQuestion
  Service.form = {}
  Service.accountApplication = {}
  Service.application = {}
  Service._householdEligibility = {}
  Service.activeSection = {}
  Service.eligibilityErrors = []
  emptyAddress = { address1: null, address2: "", city: null, state: null, zip: null }
  Service.applicationDefaults =
    id: null
    # defaults to `null` so that we differentiate "setting" vs. "switching" language
    applicationLanguage: null
    lotteryNumber: null
    status: 'draft'
    applicationSubmittedDate: null
    answeredCommunityScreening: null
    applicationSubmissionType: 'Electronic'
    applicant:
      id: 1
      home_address: angular.copy(emptyAddress)
      phone: null
      mailing_address: angular.copy(emptyAddress)
      terms: {}
    alternateContact:
      mailing_address: angular.copy(emptyAddress)
    householdMembers: []
    documents:
      'Loan pre-approval': {}
      'Homebuyer education certificate': {}
    preferences:
      liveInSf: null
      workInSf: null
      liveWorkInSf: null
      antiDisplacement: null
      neighborhoodResidence: null
      assistedHousing: null
      rentBurden: null
      aliceGriffith: null
      rightToReturnSunnydale: null
      optOut: {}
      documents:
        rentBurden: {}
    householdIncome:
      incomeTotal: null
      incomeTimeframe: null
    groupedHouseholdAddresses: []
    adaPrioritiesSelected: {}
    completedSections:
      Intro: false
      Qualify: false
      You: false
      Household: false
      Income: false
      Preferences: false
    # as you proceed through each page, validatedForms will store:
    #  [pagename]: T/F
    # to indicate if that form was left valid or invalid
    validatedForms:
      Qualify: {}
      You: {}
      Household: {}
      Income: {}
      Preferences: {}
      Review: {}
    # for storing last page of your draft, to return to. default to first page
    lastPage: 'name'
    # for storing any applicant info that we are about to override, for comparison
    overwrittenApplicantInfo: {}

  Service.currentCustomProofPreference = {}
  Service.currentRentBurdenAddress = {}
  Service.current_id = 1

  Service.applicantAccountFields = [
    'email', 'firstName', 'middleName', 'lastName', 'dob_day', 'dob_year', 'dob_month'
  ]

  Service.latinRegex = new RegExp("^[A-z0-9\u00C0-\u017E\\s'\.,-\/\+#%$:=\-_`~()]+$")

  ## initialize other related services
  Service.initServices = ->
    # initialize FileUploadService to have access to preferences / session_uid
    FileUploadService.preferences = Service.preferences
    FileUploadService.session_uid = ->
      Service.session_uid
    RentBurdenFileService.preferences = Service.preferences
    RentBurdenFileService.session_uid = ->
      Service.session_uid
    ShortFormDataService.defaultCompletedSections = Service.applicationDefaults.completedSections
  ## -------

  Service.resetApplicationData = (data = {}) ->
    application = _.merge({}, Service.applicationDefaults, data)
    angular.copy(application, Service.application)
    Service.applicant = Service.application.applicant
    Service.preferences = Service.application.preferences
    Service.alternateContact = Service.application.alternateContact
    Service.householdMember = {}
    Service.householdMembers = Service.application.householdMembers
    Service.initServices()

  Service.resetApplicationData()
  # --- end initialization

  Service.inputInvalid = (fieldName, form = Service.form.applicationForm) ->
    return false unless form
    field = form[fieldName]
    if form && field
      # special case: set "invalid email" error instead of "provide answers in english" when failing ng-pattern
      if fieldName == 'email' && field.$error.pattern
        field.$error.email = true
      field.$invalid && (!field.$pristine || form.$submitted)
    else
      false

  Service.switchingLanguage = ->
    toLang = $state.params.lang
    fromLang = Service.getLanguageCode(Service.application)
    !!fromLang && (toLang != fromLang)

  Service.completeSection = (section) ->
    Service.application.completedSections[section] = true

  Service.userCanAccessSection = (name, state = null) ->
    # user can't access later sections yet when on the welcome page
    if state and (Service.isWelcomePage(state))
      return false

    completed = Service.application.completedSections
    validated = Service.application.validatedForms

    # catch errors where validatedForms becomes undefined
    if _.isEmpty(validated)
      Raven.captureMessage('Validated forms is unexpectedly empty', {
        level: 'warning',
        extra: { sectionName: name, application: Service.application }
      })
      return false

    switch name
      when 'Qualify'
        !!Service.listingIsSale()
      when 'You'
        if Service.listingIsSale()
          # make sure all validatedForms in previous section == true
          completed.Intro &&
          completed.Qualify &&
          _.every(validated['Qualify'], (i) -> i)
        else
          true
      when 'Household'
        completed.Intro &&
        completed.You &&
        # make sure all validatedForms in previous section == true
        _.every(validated['You'], (i) -> i)
      when 'Income'
        Service.userCanAccessSection('Household') &&
        completed.Household &&
        # make sure all validatedForms in previous section == true
        _.every(validated['Household'], (i) -> i)
      when 'Preferences'
        Service.userCanAccessSection('Income') &&
        completed.Income &&
        # make sure all validatedForms in previous section == true
        _.every(validated['Income'], (i) -> i)
      when 'Review'
        Service.userCanAccessSection('Preferences') &&
        completed.Preferences &&
        # make sure all validatedForms in previous section == true
        _.every(validated['Preferences'], (i) -> i)
      else
        false

  Service.storeLastPage = (stateName) ->
    lastPage = _.replace(stateName, 'dahlia.short-form-application.', '')
    # don't save the fact that we landed on "choose-xxx" pages
    return if _.includes([
        'choose-draft',
        'choose-applicant-details',
        'continue-previous-draft',
        'welcome-back',
        'sign-in',
      ], lastPage)
    # don't save the fact that we're in the middle of verifying address, can end up in a weird state
    if lastPage == 'verify-address'
      lastPage = 'contact'
    else if lastPage == 'household-member-verify-address'
      lastPage = 'household-members'
    else if lastPage == 'alice-griffith-verify-address'
      lastPage = 'right-to-return-preference'
    Service.application.lastPage = lastPage

  Service.copyHomeToMailingAddress = ->
    unless Service.applicant.hasAltMailingAddress
      angular.copy(Service.applicant.home_address, Service.applicant.mailing_address)

  Service.validMailingAddress = ->
    !! (Service.applicant.mailing_address.address1 &&
        Service.applicant.mailing_address.city &&
        Service.applicant.mailing_address.state &&
        Service.applicant.mailing_address.zip)

  Service.clearPhoneData = (type) ->
    if type == 'alternate'
      Service.applicant.noPhone = false
      Service.applicant.alternatePhone = null
      Service.applicant.alternatePhoneType = null
    else if type == 'phone'
      Service.applicant.additionalPhone = false
      Service.applicant.phone = null
      Service.applicant.phoneType = null

  Service.clearAlternateContactDetails = ->
    clearedData = { alternateContactType: 'None' }
    validated = Service.application.validatedForms.You
    delete validated['alternate-contact-name']
    delete validated['alternate-contact-phone-address']
    angular.copy(clearedData, Service.application.alternateContact)

  Service._nextId = ->
    if Service.householdMembers.length > 0
      max_id = _.maxBy(Service.householdMembers, 'id').id
    else
      max_id = Service.current_id
    Service.current_id = max_id + 1

  Service.addHouseholdMember = (householdMember) ->
    if householdMember.hasSameAddressAsApplicant == 'Yes'
      # copy applicant's preferenceAddressMatch to householdMember
      householdMember.preferenceAddressMatch = Service.applicant.preferenceAddressMatch
    if !householdMember.id
      householdMember.id = Service._nextId()
      Service.householdMembers.push(angular.copy(householdMember))
    else
      # update existing householdMember
      householdMemberToUpdate = _.find(Service.householdMembers, {id: householdMember.id})
      angular.copy(householdMember, householdMemberToUpdate)
    Service.invalidateHouseholdForm()

  Service.resetHouseholdMember = ->
    angular.copy({}, Service.householdMember)

  Service.getHouseholdMember = (id) ->
    angular.copy(_.find(Service.householdMembers, {id: parseInt(id)}), Service.householdMember)

  Service.cancelHouseholdMember = ->
    # list of all householdMembers minus the cancelled one
    householdMembers = Service.householdMembers.filter (m) ->
      (m != Service.householdMember && m.id != Service.householdMember.id)
    Service.cancelPreferencesForMember(Service.householdMember.id)
    # persist the changes to Service.householdMembers
    Service.resetHouseholdMember()
    angular.copy(householdMembers, Service.householdMembers)
    Service.invalidateHouseholdForm()

  Service.cancelPreferencesForMember = (memberId) ->
    # search through all xxx_household_member items in preferences marked for this member
    _.each Service.preferences, (value, key) ->
      if key.indexOf('_household_member') > 0 and value == memberId
        preference = key.split('_household_member')[0]
        Service.cancelPreference(preference)

  Service.copyNeighborhoodMatchToHousehold = ->
    Service.householdMembers.forEach( (member) ->
      if member.hasSameAddressAsApplicant == 'Yes'
        # copy applicant's preferenceAddressMatch to householdMember
        member.preferenceAddressMatch = Service.applicant.preferenceAddressMatch
    )

  # this function sets up Service.groupedHouseholdAddresses which is used by Rent Burden preference
  # - gets called onEnter of household-monthly-rent
  # - it's used to setup the monthly-rent page as well as rent-burdened-preference pages
  # - it will reset the addresses and Rent Burden if any members/addresses have changed
  Service.groupHouseholdAddresses = ->
    groupedAddresses = []
    groupedAddress = {}

    primaryAddress = Service.applicant.home_address.address1
    primaryAddress += ' ' + Service.applicant.home_address.address2 if Service.applicant.home_address.address2
    groupedAddress.address = primaryAddress
    primaryApplicant =
      fullName: "#{Service.applicant.firstName} #{Service.applicant.lastName} (You)"
      firstName: "You"
    groupedAddress.members = [primaryApplicant]
    groupedAddresses.push(angular.copy(groupedAddress))

    _.each Service.householdMembers, (member) ->
      groupedAddress = {}
      if member.hasSameAddressAsApplicant == 'Yes'
        groupedAddress.address = primaryAddress
      else
        groupedAddress.address = member.home_address.address1
        groupedAddress.address += ' ' + member.home_address.address2 if member.home_address.address2
      matchedIndex = _.findIndex(groupedAddresses, { address: groupedAddress.address})
      name =
        fullName: "#{member.firstName} #{member.lastName}"
        firstName: member.firstName
      if matchedIndex > -1
        groupedAddresses[matchedIndex].members.push(name)
      else
        groupedAddress.members = [name]
        groupedAddresses.push(angular.copy(groupedAddress))

    _.each groupedAddresses, (groupedAddress) ->
      ShortFormDataService.initRentBurdenDocs(groupedAddress.address, Service.application)
      matchedIndex = _.findIndex(Service.application.groupedHouseholdAddresses, { address: groupedAddress.address})
      if matchedIndex > -1
        groupedAddress.monthlyRent = Service.application.groupedHouseholdAddresses[matchedIndex].monthlyRent
        groupedAddress.dontPayRent = Service.application.groupedHouseholdAddresses[matchedIndex].dontPayRent

    newAddrs = groupedAddresses
    oldAddrs = Service.application.groupedHouseholdAddresses
    if newAddrs.length != oldAddrs.length
      changed = true
    else
      diff = _.differenceWith newAddrs, oldAddrs, (newAddr, oldAddr) ->
        _.isEqual(newAddr.members, oldAddr.members) && newAddr.address == oldAddr.address
      changed = !!diff.length

    if changed # have you changed anything?
      Service.resetPreference('rentBurden')
      angular.copy(groupedAddresses, Service.application.groupedHouseholdAddresses)

  Service.setRentBurdenAddressIndex = (index) ->
    angular.copy(Service.application.groupedHouseholdAddresses[index], Service.currentRentBurdenAddress)
    Service.currentRentBurdenAddress.index = index

  Service.getRTRPreferenceKey= (listing) ->
    ListingPreferenceService.getRTRPreferenceKey(listing)

  Service.cancelPreference = (preference) ->
    if (
      (preference == 'neighborhoodResidence' && Service.eligibleForNRHP()) ||
      (preference == 'antiDisplacement' && Service.eligibleForADHP())
    )
      # cancelling NRHP or ADHP also cancels liveInSf
      Service.cancelPreference('liveInSf')
    if _.includes(['liveWorkInSf', 'liveInSf', 'workInSf'], preference)
      # cancels liveWork combo options
      Service.preferences.liveWorkInSf = false
      Service.preferences.liveWorkInSf_preference = null
    if preference == 'liveWorkInSf'
      # cancels both live and work individual options
      Service.unsetPreferenceFields('liveInSf')
      Service.unsetPreferenceFields('workInSf')
    else
      # default, unset the indicated preference
      Service.unsetPreferenceFields(preference)

  Service.unsetPreferenceFields = (prefType) ->
    # clear out all fields for this preference
    Service.preferences[prefType] = null
    if prefType == 'rentBurden'
      RentBurdenFileService.deleteRentBurdenPreferenceFiles(Service.listing.Id)
    else
      Service.preferences["#{prefType}_household_member"] = null
      Service.preferences["#{prefType}_proofOption"] = null
      Service.preferences["#{prefType}_preference"] = null
      opts = {prefType: prefType}
      FileUploadService.deleteFile(Service.listing, opts)
      if Service.preferences["#{prefType}_certificateNumber"]
        Service.preferences["#{prefType}_certificateNumber"] = null
      if Service.preferences["#{prefType}_address"]
        Service.preferences["#{prefType}_address"] = null

  Service.cancelOptOut = (preference) ->
    Service.application.preferences.optOut[preference] = false
    # For NRHP and ADHP, if the applicant is eligible and can choose to claim the
    # preference, we cancel Opt Out for Live/Work as well
    if (
      (preference == 'neighborhoodResidence' && Service.eligibleForNRHP()) ||
      (preference == 'antiDisplacement' && Service.eligibleForADHP())
    )
      Service.cancelOptOut('liveWorkInSf')

  Service.preferenceRequired = (preference) ->
    # pref is required if we are NOT opted out
    !Service.preferences.optOut[preference]

  Service.setFormPreferenceType = (preference) ->
    if preference == 'liveWorkInSf'
      Service.form.currentPreferenceType = Service.liveWorkPreferenceType()
    else
      Service.form.currentPreferenceType = preference

  Service.showPreference = (preference) ->
    return false unless Service.listingHasPreference(preference)
    switch preference
      when 'liveWorkInSf'
        Service.workInSfMembers().length > 0 && Service.liveInSfMembers().length > 0
      when 'liveInSf'
        Service.liveInSfMembers().length > 0 && Service.workInSfMembers().length == 0
      when 'workInSf'
        Service.workInSfMembers().length > 0 && Service.liveInSfMembers().length == 0
      else
        true

  Service.liveWorkPreferenceType = ->
    if Service.showPreference('liveWorkInSf')
      'liveWorkInSf'
    else if Service.showPreference('liveInSf')
      'liveInSf'
    else
      'workInSf'

  Service.checkHouseholdEligibility = (listing) ->
    params =
      listing_id: listing.Id,
      eligibility:
        householdsize: Service.householdSize()
        incomelevel: Service.calculateHouseholdIncome()
        childrenUnder6: Service._childrenUnder6()
    $http.post("/api/v1/short-form/validate-household", params).success((data, status, headers, config) ->
      # assigning value to object for now to make function unit testable
      angular.copy(data, Service._householdEligibility)
      return Service.householdEligibility
    )

  Service.hasCompleteRentBurdenFiles = ->
    _.every Service.application.groupedHouseholdAddresses, (groupedAddress) ->
      Service.hasCompleteRentBurdenFilesForAddress(groupedAddress.address)

  Service.hasCompleteRentBurdenFilesForAddress = (address) ->
    files = Service.application.preferences.documents.rentBurden[address]
    return false unless files
    files.lease.file && _.some(_.map(files.rent, 'file'))

  Service.householdSize = ->
    Service.application.householdMembers.length + 1

  Service._childrenUnder6 = ->
    allMembers = angular.copy(Service.application.householdMembers)
    allMembers.push(Service.applicant)
    _.reduce(allMembers, (count, member) ->
      dob = "#{member.dob_year}-#{member.dob_month}-#{member.dob_day}"
      dob = moment(dob, 'YYYY-MM-DD')
      age = moment().diff(dob, 'years')
      count + (if age < 6 then 1 else 0)
    , 0)

  Service.calculateHouseholdIncome = ->
    income = Service.application.householdIncome || 0
    if income.incomeTimeframe == 'per_year'
      income.incomeTotal
    else if income.incomeTimeframe == 'per_month'
      income.incomeTotal * 12

  Service.clearAddressRelatedProofForMember = (member) ->
    addressPrefTypes = [ 'liveInSf', 'neighborhoodResidence', 'antiDisplacement' ]
    addressPrefTypes.forEach (prefType) ->
      selectedMember = Service.preferences[prefType + '_household_member']
      if member.id == selectedMember
        opts = {prefType: prefType}
        FileUploadService.deleteFile(Service.listing, opts)

  # update lists of eligible people for the dropdowns for these preferences
  Service.refreshPreferences = (type = 'all') ->
    if type == 'liveWorkInSf' || type == 'all'
      Service._updatePreference('liveInSf', Service.liveInSfMembers())
      Service._updatePreference('workInSf', Service.workInSfMembers())
    if type == 'neighborhoodResidence' || type == 'all'
      Service._updatePreference('neighborhoodResidence', Service.liveInTheNeighborhoodMembers())
    if type == 'antiDisplacement' || type == 'all'
      Service._updatePreference('antiDisplacement', Service.liveInTheNeighborhoodMembers())

  Service.eligibleMembers = (preference) ->
    switch preference
      when 'liveInSf'
        Service.liveInSfMembers()
      when 'workInSf'
        Service.workInSfMembers()
      when 'neighborhoodResidence', 'antiDisplacement'
        Service.liveInTheNeighborhoodMembers()
      else
        Service.fullHousehold()

  Service.liveInSfMembers = ->
    applicantLivesInSf = _.lowerCase(Service.applicant.home_address.city) == 'san francisco'
    liveInSfMembers = Service.application.householdMembers.filter (member) ->
      if member.hasSameAddressAsApplicant == 'No'
        _.lowerCase(member.home_address.city) == 'san francisco'
      else
        member.hasSameAddressAsApplicant == 'Yes' && applicantLivesInSf
    liveInSfMembers.unshift(Service.applicant) if applicantLivesInSf
    return liveInSfMembers

  Service.workInSfMembers = ->
    Service.fullHousehold().filter (member) ->
      member.workInSf == 'Yes'

  Service.liveInTheNeighborhoodMembers = ->
    # used by both NRHP / ADHP
    Service.fullHousehold().filter (member) ->
      # find all household members that match NRHP and only for sf to avoid south san francisco
      member.preferenceAddressMatch == 'Matched' &&
        ((member.hasSameAddressAsApplicant == 'Yes' && _.lowerCase(Service.applicant.home_address.city) == 'san francisco') ||
        (member.home_address && _.lowerCase(member.home_address.city) == 'san francisco'))

  Service.fullHousehold = ->
    # return an array with the Household and Primary Applicant
    # JS concat creates a new array (does not modify HH member array)
    Service.application.householdMembers.concat([Service.applicant])

  Service.listingHasPreference = (preference) ->
    ListingPreferenceService.hasPreference(preference, ListingDataService.listing)

  Service.listingHasRTRPreference = () ->
    ListingPreferenceService.hasRTRPreference(ListingDataService.listing)

  Service.eligibleForLiveWork = ->
    return false unless Service.listingHasPreference('liveWorkInSf')
    liveInSfEligible = Service.liveInSfMembers().length > 0
    workInSfEligible = Service.workInSfMembers().length > 0
    return (liveInSfEligible || workInSfEligible)

  Service.eligibleForNRHP = ->
    return false unless Service.listingHasPreference('neighborhoodResidence')
    Service.liveInTheNeighborhoodMembers().length > 0

  Service.eligibleForADHP = ->
    return false unless Service.listingHasPreference('antiDisplacement')
    Service.liveInTheNeighborhoodMembers().length > 0

  Service.eligibleForAssistedHousing = ->
    return false unless Service.listingHasPreference('assistedHousing')
    Service.application.hasPublicHousing == 'Yes'

  Service.eligibleForRentBurden = ->
    return false unless Service.listingHasPreference('rentBurden')
    totalMonthlyRent = _.sumBy(Service.application.groupedHouseholdAddresses, 'monthlyRent')
    incomeTotal = parseFloat(Service.application.householdIncome.incomeTotal)
    if Service.application.householdIncome.incomeTimeframe == 'per_month'
      ratio = totalMonthlyRent / incomeTotal
    else
      ratio = (totalMonthlyRent * 12) / incomeTotal
    # must have answered "No" and rent > 50% of income
    Service.application.hasPublicHousing == 'No' && ratio >= .5

  Service.applicantHasNoPreferences = ->
    # true if no preferences are selected at all
    prefList = ShortFormDataService.preferences
    customPrefs = _.map(Service.listing.customPreferences, 'listingPreferenceID')
    customProofPrefs = _.map(Service.listing.customProofPreferences, 'listingPreferenceID')
    prefList = prefList.concat(customPrefs, customProofPrefs)
    return !_.some(_.pick(Service.preferences, prefList))

  Service.applicationHasPreference = (preference) ->
    !! Service.preferences[preference]

  Service.copyNeighborhoodToLiveInSf = (preference) ->
    # preference is either neighborhoodResidence or antiDisplacement
    # clear out any previously entered values for live/work
    Service.cancelPreference('workInSf')
    # reset the form so it's not in an "invalid" state
    Service.resetLiveWorkForm()
    # copy Neighborhood values to liveInSf
    neighborhoodMember = Service.preferences["#{preference}_household_member"]
    proofOption = Service.preferences["#{preference}_proofOption"]
    # copy e.g. "Water Bill" so that it shows up properly on the review screen
    proofOption = Service.preferences.documents[preference].proofOption
    file = Service.preferences.documents[preference].file
    Service.preferences.liveInSf = true
    Service.preferences.liveInSf_household_member = neighborhoodMember
    Service.preferences.liveInSf_proofOption = proofOption
    Service.preferences.documents.liveInSf = {proofOption: proofOption}

  Service._updatePreference = (preference, eligibleMembers) ->
    members = eligibleMembers.map (member) -> member.id
    selectedMember = Service.preferences[preference + '_household_member']
    # if nobody is eligible
    if _.isEmpty(members) ||
      # or we've selected the preference and the selected member is no longer eligible
      (Service.preferences[preference] && selectedMember && !_.includes(members, selectedMember)) ||
      # or we're eligible but we don't seem to have any answer (selected or opted out)
      (!_.isEmpty(members) && !Service.preferences.optOut && !Service.preferences[preference])
        Service.resetPreference(preference)

  Service.resetPreference = (preference) ->
    # this should be called when you're cancelling the preference from an external factor
    # e.g. you changed your address and are no longer eligible for liveInSf,
    # so we totally cancel liveInSf and reset the preference validatedForms
    Service.application.completedSections.Preferences = false
    angular.copy({}, Service.application.validatedForms.Preferences)
    # cancel both preference and optOut, this preference is no longer valid
    Service.cancelPreference(preference)
    Service.cancelOptOut(preference)

  Service.onExit = (e) ->
    AnalyticsService.trackFormAbandon('Application')
    e.returnValue = $translate.instant('t.are_you_sure_you_want_to_leave')

  Service.isWelcomePage = (state) ->
    !!state.name.match(/short-form-welcome\./)

  Service._isPrimaryOrHouseholdAddressPage = (state) ->
    stateName = state.name.replace(/dahlia.short-form-(welcome|application)\./, "")
    stateName.match(/contact/) || stateName.match(/household-member-form/)

  Service.isShortFormPage = (state) ->
    !!state.name.match(/short-form-application\./)

  Service.sendToLastPageofApp = (toState) ->
    appLastPage = Service.application.lastPage
    if toState.name != "dahlia.short-form-application.#{appLastPage}" &&
      $state.href("dahlia.short-form-application.#{appLastPage}")
        $state.go("dahlia.short-form-application.#{appLastPage}")

  Service.checkFormState = (stateName, section) ->
    if Service.form.applicationForm
      stateName = stateName.replace(/dahlia.short-form-(welcome|application)\./, "")
      # special case for household-member-form
      return if stateName.match(/household-member-form/)
      # special case for rentBurdened subpages
      return if stateName.match(/rent-burdened-preference-edit/)
      # special case for welcome back page
      return if stateName.match(/welcome-back/)
      isValid = Service.form.applicationForm.$valid
      # special case for contact form
      if stateName.match(/contact/)
        applicant = Service.applicant
        addressValid = !_.isNil(applicant.preferenceAddressMatch)
        isValid = isValid && addressValid

      # catch errors where validatedForms becomes undefined
      if _.isEmpty(Service.application.validatedForms)
        Raven.captureMessage('Validated forms is unexpectedly empty', {
          level: 'warning',
          extra: { stateName: stateName, application: Service.application }
        })
        return false

      Service.application.validatedForms[section.name][stateName] = isValid
  Service.authorizedToProceed = (toState, fromState, toSection) ->
    return true unless toState && fromState
    if not Service.userCanAccessSection(toSection.name)
      Raven.captureMessage('User attempted to access unauthorized section', {
        level: 'warning',
        extra: {
          toState: toState.url, fromState: fromState,
          application: Service.application
        }
      })
      return false
    # they're "jumping ahead" if they're not coming from a short form page or create-account
    # and they're trying to go to a page that's not either the first page, or their stored lastPage
    prerequisitesPage = "dahlia.short-form-application.prerequisites"
    lastPage = "dahlia.short-form-application.#{Service.application.lastPage}"
    jumpAhead = Service.isShortFormPage(toState) &&
                !Service.isShortFormPage(fromState) &&
                !_.includes([prerequisitesPage, lastPage], toState.name)
    return !jumpAhead

  Service.isLeavingShortForm = (toState, fromState) ->
    Service.isShortFormPage(fromState) && !Service.isShortFormPage(toState)

  Service.isEnteringShortForm = (toState, fromState) ->
    !Service.isShortFormPage(fromState) && Service.isShortFormPage(toState)

  Service.isLeavingConfirmationToSignIn = (toState, fromState) ->
    fromState.name == 'dahlia.short-form-application.create-account' &&
      toState.name == 'dahlia.sign-in' &&
      Service.application.status.match(/submitted/i)

  Service.isLeavingConfirmation = (toState, fromState) ->
    Service.application.status.match(/submitted/i) &&
      toState.name != 'dahlia.sign-in' &&
      !Service.isShortFormPage(toState) &&
      (fromState.name == 'dahlia.short-form-application.confirmation' ||
      fromState.name == 'dahlia.short-form-application.review-submitted' ||
      fromState.name == 'dahlia.short-form-application.create-account')


  Service.hittingBackFromConfirmation = (fromState, toState) ->
    # going from confirmation to a short form page that ISN'T "create-account" or "review"
    fromState.name == 'dahlia.short-form-application.confirmation' &&
      toState.name != 'dahlia.short-form-application.review-submitted' &&
      toState.name != 'dahlia.short-form-application.create-account' &&
      toState.name != 'dahlia.short-form-application.confirmation' &&
      Service.isShortFormPage(toState)

  Service.leaveAndResetShortForm = (toState, toParams) ->
    # disable the onbeforeunload so that you are no longer bothered if you
    # try to reload the listings page, for example
    $window.removeEventListener 'beforeunload', Service.onExit
    unless toState.name == 'dahlia.short-form-review'
      Service.resetApplicationData()
    if toParams.timeout
      AnalyticsService.trackTimeout('Application')
    else
      AnalyticsService.trackFormAbandon('Application')

  Service.invalidateNameForm = ->
    Service.application.validatedForms['You']['name'] = false

  Service.invalidateContactForm = ->
    Service.application.validatedForms['You']['contact'] = false

  Service.invalidateAltContactTypeForm = ->
    Service.application.validatedForms['You']['alternate-contact-type'] = false

  Service.invalidateIncomeForm = ->
    Service.application.completedSections['Income'] = false
    Service.application.validatedForms['Income']['income'] = false

  Service.invalidateHouseholdForm = ->
    Service.application.completedSections['Household'] = false
    Service.application.completedSections['Preferences'] = false
    Service.application.completedSections['Income'] = false

  Service.invalidatePreferencesForm = ->
    Service.application.completedSections['Preferences'] = false

  Service.resetLiveWorkForm = ->
    return unless Service.application.validatedForms['Preferences']
    delete Service.application.validatedForms['Preferences']['live-work-preference']

  Service.resetCompletedSections = ->
    angular.copy(Service.applicationDefaults.completedSections, Service.application.completedSections)

  Service.resetMonthlyRentForm = ->
    return unless Service.application.validatedForms['Household']
    Service.application.groupedHouseholdAddresses = []
    delete Service.application.validatedForms['Household']['household-monthly-rent']

  Service.invalidateMonthlyRentForm = ->
    return unless Service.application.validatedForms['Household']
    Service.application.validatedForms['Household']['household-monthly-rent'] = false

  Service.resetAssistedHousingForm = ->
    Service.cancelPreference('assistedHousing')
    return unless Service.application.validatedForms['Preferences']
    delete Service.application.validatedForms['Preferences']['assisted-housing-preference']

  Service.preferenceFileIsLoading = (fileType) ->
    !! Service.preferences["#{fileType}_loading"]

  Service.invalidateCurrentSectionIfIncomplete = ->
    # this will set the current section "completedSections" to false
    # in the event that you've gone back and edited a form and left it in an invalid state
    section = Service.activeSection
    return unless section && section.name
    isValid = Service.checkFormState($state.current.name, section)
    if !isValid && Service.application.completedSections[section.name]
      Service.application.completedSections[section.name] = false

  Service.submitApplication = (options={}) ->
    # Turns off autosave requests based on config variable
    return if options.autosave && $window.AUTOSAVE != 'true'

    if options.finish
      Service.application.status = 'submitted'

    Service.invalidateCurrentSectionIfIncomplete()
    # clean up any old data hanging around from now invalidated/changed preferences
    Service.refreshPreferences()
    Service.application.applicationSubmittedDate = moment().tz('America/Los_Angeles').format('YYYY-MM-DD')
    Service.application.session_uid = Service.session_uid
    Service.application.externalSessionId = Service.session_uid
    params =
      # $translate.use() with no arguments is a getter for the current lang setting
      locale: $translate.use()
      uploaded_file:
        session_uid: Service.session_uid

    autosave = if options.autosave then '?autosave=true' else ''
    # TODO: remove hotfix for marking initial autosaves that come from the Name page
    autosave += '&initialSave=true' if (options.initialSave && options.autosave)

    if options.attachToAccount
      # NOTE: This temp_session_id is vital for the operation of Create Account on "save and finish"
      params.temp_session_id = Service.session_uid

    if Service.application.id
      # update
      id = Service.application.id
      submitMethod = $http.put
      if options.attachToAccount
        submitPath = "/api/v1/short-form/claim-application/#{id}"
      else
        submitPath = "/api/v1/short-form/application/#{id}#{autosave}"
    else
      # create
      submitMethod = $http.post
      submitPath = "/api/v1/short-form/application#{autosave}"

    # although we have already attempted to fetch the listing preferences in the resolve
    # for the dahlia.short-form-application route, sometimes they are not yet done being
    # fetched by the time the user gets here, so we check if we need to fetch them here
    if ListingDataService.listing.preferences
      params.application = ShortFormDataService.formatApplication(Service.listing.Id, Service.application)
      Service._sendApplication(submitMethod, submitPath, params)
    else
      Raven.captureMessage('Undefined listing preferences', {
        level: 'warning', extra: { listing: ListingDataService.listing }
      })
      ListingPreferenceService.getListingPreferences(ListingDataService.listing).then ->
        params.application = ShortFormDataService.formatApplication(Service.listing.Id, Service.application)
        Service._sendApplication(submitMethod, submitPath, params)

  Service._sendApplication = (method, path, params) ->
    # TODO: remove this logging once the geocoding bug has been resolved:
    # (https://www.pivotaltracker.com/story/show/155672733)
    # logging to provide visibility into cases we have been seeing where an
    # application somehow gets submitted without preferenceAddressMatch set
    # for primary applicant or a household member
    if params.application.status == 'submitted'
      primaryApplicant = params.application.primaryApplicant
      if primaryApplicant
        primaryPrefAddressMatchEmpty = _.isNil(primaryApplicant.preferenceAddressMatch)
        if primaryPrefAddressMatchEmpty
          Raven.captureException(new Error('Application submitted without primary applicant preferenceAddressMatch value'))

      householdMembers = params.application.householdMembers
      unless _.isEmpty(householdMembers)
        householdPrefAddressMatchEmpty = _.some(householdMembers, (member) -> _.isNil(member.preferenceAddressMatch))
        if householdPrefAddressMatchEmpty
          Raven.captureException(new Error('Application submitted without household member preferenceAddressMatch value'))
    method(path, params).success((data, status, headers, config) ->
      if data.lotteryNumber
        Service.application.lotteryNumber = data.lotteryNumber
        Service.application.id = data.id
    ).error( (data, status, headers, config) ->
      # error alert is handled by httpProvider.interceptor in angularProviders
      return
    )

  Service.deleteApplication = (id) ->
    $http.delete("/api/v1/short-form/application/#{id}").success((data, status) ->
      true
    )

  Service.getApplication = (id) ->
    $http.get("/api/v1/short-form/application/#{id}").success((data, status) ->
      Service.loadApplication(data)
    )

  Service.getMyApplicationForListing = (listingId = Service.listing.Id, opts = {}) ->
    autofill = if opts.autofill then '?autofill=true' else ''
    $http.get("/api/v1/short-form/listing-application/#{listingId}#{autofill}").success((data, status) ->
      if opts.forComparison
        Service.loadAccountApplication(data)
      else
        Service.loadApplication(data)
    )

  Service.keepCurrentDraftApplication = (loggedInUser) ->
    Service.importUserData(loggedInUser)
    Service.application.id = Service.accountApplication.id
    # now that we've overridden current application ID with our old one
    # submitApplication() will update our existing draft on salesforce
    Service.submitApplication()

  Service.resetAndReplaceApp = ->
    Service.resetApplicationData({ id: Service.application.id })
    $state.go('dahlia.short-form-application.name')

  Service.loadApplication = (data) ->
    formattedApp = {}
    if data.application && !_.isEmpty(data.application)
      files = data.files || []
      if data.application.status.match(/submitted/i) && data.application.listing
        # on submitted app the listing is loaded along with it
        ListingDataService.loadListing(data.application.listing)
      formattedApp = ShortFormDataService.reformatApplication(data.application, files)
      Service.checkForProofPrefs(formattedApp) unless formattedApp.status.match(/submitted/i)

    # pull answeredCommunityScreening from the current session since that Q is answered first
    formattedApp.answeredCommunityScreening ?= Service.application.answeredCommunityScreening
    # this will setup Service.application with the loaded data
    Service.resetApplicationData(formattedApp)
    # one last step, reconcile any uploaded files with your saved member + preference data
    if !_.isEmpty(Service.application) && Service.application.status.match(/draft/i)
      Service.refreshPreferences('all')

  Service.checkForProofPrefs = (formattedApp = Service.application) ->
    proofPrefs = [
      'liveInSf',
      'workInSf',
      'neighborhoodResidence',
      'antiDisplacement',
      'assistedHousing',
    ]
    formattedApp.completedSections ?= {}
    # make sure all files are present for proof-requiring preferences, otherwise don't let them jump ahead
    _.each proofPrefs, (prefType) ->
      hasPref = formattedApp.preferences[prefType]
      docs = formattedApp.preferences.documents[prefType]
      if hasPref && (_.isEmpty(docs) || _.isEmpty(docs.file))
        formattedApp.completedSections['Preferences'] = false
    if formattedApp.preferences.rentBurden && !Service.hasCompleteRentBurdenFiles()
      formattedApp.completedSections['Preferences'] = false

  Service.loadAccountApplication = (data) ->
    return false if _.isEmpty(data.application)
    formattedApp = ShortFormDataService.reformatApplication(data.application)
    angular.copy(formattedApp, Service.accountApplication)

  Service.importUserData = (loggedInUser) ->
    accountData = _.pick(loggedInUser, Service.applicantAccountFields)
    applicant = angular.copy(Service.applicant)
    # merge the data into applicant
    _.merge Service.applicant, accountData
    changed = !_.isEqual(Service.applicant, applicant)
    # return T/F if data was changed or not
    return changed

  Service.hasDifferentInfo = (applicant, loggedInUser) ->
    fields = [
      'email', 'firstName', 'middleName', 'lastName'
    ]
    userData = _.omitBy(_.pick(loggedInUser, fields), _.isNil)
    userData.DOB = ShortFormDataService.formatUserDOB(loggedInUser)
    applicantData = _.omitBy(_.pick(applicant, fields), _.isNil)
    applicantData.DOB = ShortFormDataService.formatUserDOB(applicant)
    !_.isEqual(userData, applicantData)

  ####### Address validation functions
  Service.validateApplicantAddress = (callback) ->
    # address validation errors are handled in the Rails controller
    AddressValidationService.validate(
      address: Service.applicant.home_address
      type: 'home'
    ).success( ->
      Service.copyHomeToMailingAddress()
      # gis data errors are handled in the Rails controller
      GISService.getGISData(
        address: Service.applicant.home_address
        member: Service.applicant
        applicant: Service.applicant
        listing: Service.listing
        projectId: Service.getProjectIdForBoundaryMatching()
      ).then(
        Service.afterGeocode.bind(null, true, callback)
      ).catch(
        Service.afterGeocode.bind(null, true, callback)
      )
    )

  Service.validateHouseholdMemberAddress = (callback) ->
    # address validation errors are handled in the Rails controller
    AddressValidationService.validate(
      address: Service.householdMember.home_address
      type: 'home'
    ).success( ->
      # gis data errors are handled in the Rails controller
      GISService.getGISData(
        address: Service.householdMember.home_address
        member: Service.householdMember
        applicant: Service.applicant
        listing: Service.listing
        projectId: Service.getProjectIdForBoundaryMatching()
      ).then(
        Service.afterGeocode.bind(null, false, callback)
      ).catch(
        Service.afterGeocode.bind(null, false, callback)
      )
    )

  # Return true if the listing is an at least 1 senior building AND oldest member in household is not a senior
  Service.householdDoesNotMeetAtLeastOneSeniorRequirement = ->
    requirement = Service.listing.Reserved_Community_Requirement || ''
    reservedType = Service.listing.Reserved_community_type || ''
    return false unless !!reservedType.match(/senior/i)  && !!requirement.match(/One household member/g)
    Service.maxHouseholdAge() < Service.listing.Reserved_community_minimum_age

  # This returns true if the listing is an all senior building AND applicant/app member does not meet age requirement
  Service.applicantDoesNotmeetAllSeniorBuildingRequirements = (member = 'applicant') ->
    listing = Service.listing
    reservedType = listing.Reserved_community_type || ''
    requirement = listing.Reserved_Community_Requirement || ''
    return false unless !!reservedType.match(/senior/i) && !!requirement.match(/entire household/i)

    if _.isString(member)
      # are we evaluating a form value
      age = Service.memberAgeOnForm(member)
    else
      # or evaluating an appMember object
      age = Service.memberAge(member)

    age < listing.Reserved_community_minimum_age

  Service.addSeniorEligibilityError = ->
    requirement = Service.listing.Reserved_Community_Requirement || ''
    age = { minAge: Service.listing.Reserved_community_minimum_age }
    if !!requirement.match(/entire household/i)
      Service.eligibilityErrors.push($translate.instant('error.senior_everyone', age))
    else
      Service.eligibilityErrors.push($translate.instant('error.senior_anyone', age))

  Service.memberAge = (member) ->
    dob = moment("#{member.dob_year}-#{member.dob_month}-#{member.dob_day}", 'YYYY-MM-DD')
    age = moment().diff(dob, 'years')
    age

  Service.maxHouseholdAge = ->
    _.max(_.map(Service.fullHousehold(), Service.memberAge))

  # different function from memberAge above, this is used for validating what has
  # been typed into the form, vs. what is stored in an application member object
  Service.memberAgeOnForm = (member = 'applicant') ->
    dob = Service.memberDOBMoment(member)
    ShortFormDataService.DOBtoAge(dob)

  Service.memberDOBMoment = (member = 'applicant') ->
    values = Service.DOBValues(member)
    form = Service.form.applicationForm
    # have to grab viewValue because if the field is in error state the model will be undefined
    year = parseInt(form['date_of_birth_year'].$viewValue)
    ShortFormDataService.DOBtoMoment(year, values.month, values.day)

  Service.DOBValues = (member = 'applicant') ->
    {
      month: parseInt(Service[member].dob_month)
      day: parseInt(Service[member].dob_day)
      year: parseInt(Service[member].dob_year)
    }

  Service.afterGeocode = (isPrimary, callback, response) ->
    member = if isPrimary then Service.applicant else Service.householdMember

    if _.isEmpty(response) || _.isEmpty(response.gis_data)
      member.geocodingData = null
      member.preferenceAddressMatch = null
    else
      member.geocodingData = response.gis_data
      match = switch response.gis_data.boundary_match
        when null then ''
        when true then 'Matched'
        when false then 'Not Matched'
      member.preferenceAddressMatch = match

    if isPrimary
      Service.copyNeighborhoodMatchToHousehold()
    else
      Service.addHouseholdMember(member)

    # check if eligibility has changed
    Service.refreshPreferences('all')
    Service.clearAddressRelatedProofForMember(member)
    callback()

  Service.applicationWasSubmitted = (application = Service.application) ->
    # from the user's perspective, "Removed" applications should look the same as "Submitted" ones
    _.includes(['Submitted', 'Removed'], application.status)

  Service.setApplicationLanguage = (lang) ->
    Service.application.applicationLanguage = SharedService.getLanguageName(lang)

  Service.getLanguageCode = (application) ->
    # will take "English" and return "en"
    SharedService.getLanguageCode(application.applicationLanguage)

  Service.applicationCompletionPercentage = (application) ->
    pct = 5
    pct += 30 if application.completedSections.You
    pct += 25 if application.completedSections.Household
    pct += 10 if application.completedSections.Income
    pct += 30 if application.completedSections.Preferences
    pct

  # wrappers for other Service functions
  Service.DOBValid = ShortFormDataService.DOBValid

  Service.hasHouseholdPublicHousingQuestion = ->
    ListingPreferenceService.hasPreference('assistedHousing', ListingDataService.listing)

  Service.formattedBuildingAddress = (listing, display) ->
    ListingDataService.formattedAddress(listing, 'Building', display)

  Service.listingIsRental = ->
    ListingIdentityService.isRental(Service.listing)

  Service.listingIsSale = ->
    ListingIdentityService.isSale(Service.listing)

  Service.listingIsHabitat = ->
    ListingIdentityService.isHabitatListing(Service.listing)

  Service.listingHasReservedUnitType = (type) ->
    ListingUnitService.listingHasReservedUnitType(Service.listing, type)

  Service.getProjectIdForBoundaryMatching = ->
    ListingDataService.getProjectIdForBoundaryMatching(Service.listing)

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ShortFormApplicationService.$inject = [
  '$translate', '$http', '$state', '$window', 'uuid',
  'AddressValidationService',
  'AnalyticsService',
  'FileUploadService',
  'GISService',
  'ListingConstantsService',
  'ListingDataService',
  'ListingIdentityService',
  'ListingPreferenceService',
  'ListingUnitService',
  'RentBurdenFileService',
  'SharedService',
  'ShortFormDataService'
]

angular
  .module('dahlia.services')
  .service('ShortFormApplicationService', ShortFormApplicationService)
