ShortFormDataService = (ListingDataService, ListingConstantsService, ListingPreferenceService, ListingUnitService, SharedService) ->
  Service = {}
  Service.preferences = _.keys(ListingDataService.preferenceMap)
  Service.metaFields = [
    'completedSections'
    'session_uid'
    'lastPage'
    'groupedHouseholdAddresses'
    'aliceGriffith_address_verified'
  ]

  Service.WHITELIST_FIELDS =
    application: [
      'id'
      'applicationLanguage'
      'listingID'
      'applicationSubmittedDate'
      'applicationSubmissionType'
      'status'
      'autofill'
      'hasPublicHousing'
      'hasMilitaryService'
      'hasDevelopmentalDisability'
      'answeredCommunityScreening'
      'externalSessionId'
      'hasCompletedHomebuyerEducation'
      'isFirstTimeHomebuyer'
      'hasLoanPreapproval'
      'hasMinimumCreditScore'
      'lendingAgent'
      'homebuyerEducationAgency'
      'referral'
      'isNonPrimaryMemberVeteran'
    ]
    primaryApplicant: [
      'alternatePhone',
      'alternatePhoneType',
      'appMemberId',
      'asianOther',
      'blackOther',
      'candidateScore',
      'contactId',
      'email',
      'firstName',
      'gender',
      'genderOther',
      'hasAltMailingAddress',
      'indigenousCentralSouthAmericaGroup',
      'indigenousNativeAmericanGroup',
      'indigenousOther',
      'isVeteran',
      'lastName',
      'latinoOther',
      'menaOther',
      'middleName',
      'noAddress',
      'noEmail',
      'noPhone',
      'otherLanguage',
      'pacificIslanderOther',
      'phone',
      'phoneType',
      'preferenceAddressMatch',
      'primaryLanguage',
      'raceEthnicity',
      'sexualOrientation',
      'sexualOrientationOther',
      'whichComponentOfLocatorWasUsed',
      'whiteOther',
      'xCoordinate',
      'yCoordinate'
    ]
    alternateContact: [
      'appMemberId', 'alternateContactType', 'alternateContactTypeOther',
      'agency', 'email', 'firstName', 'lastName', 'phone'
    ]
    householdMember: [
      'appMemberId', 'firstName', 'middleName', 'lastName',
      'relationship', 'preferenceAddressMatch', 'noAddress',
      'xCoordinate', 'yCoordinate', 'whichComponentOfLocatorWasUsed', 'candidateScore',
      'isVeteran',
    ]

  Service.showVeteransApplicationQuestion = ->
    SharedService.showVeteransApplicationQuestion(ListingDataService.listing)

  # Format application for Salesforce Processing.
  Service.formatApplication = (listingId, application) ->
    # _.pick creates a new object
    sfApp = _.pick application, Service.WHITELIST_FIELDS.application
    sfApp.listingID = listingId

    # check to see if we should build up alternateContact object
    if application.alternateContact.alternateContactType != 'None' &&
      application.alternateContact.firstName &&
      application.alternateContact.lastName
        sfApp.alternateContact = _.pick application.alternateContact, Service.WHITELIST_FIELDS.alternateContact
        address = Service._formatAddress(application.alternateContact, 'mailing_address')
        _.merge sfApp.alternateContact, address

    # Veterans Preference is different from other preferences, the backend needs to know who is a veteran in the householdMember/primaryApplicant object
    veteranMemberId = null
    if application.isAnyoneAVeteran == 'Yes' && application.preferences.veterans_household_member
      veteranMemberId = parseInt(application.preferences.veterans_household_member, 10)

    # primaryApplicant
    sfApp.primaryApplicant = _.pick application.applicant, Service.WHITELIST_FIELDS.primaryApplicant
    sfApp.primaryApplicant.dob = Service.formatUserDOB(application.applicant)
    sfApp.primaryApplicant.workInSf = Service._formatBoolean(application.applicant.workInSf)
    _.merge sfApp.primaryApplicant, Service._formatGeocodingData(application.applicant)
    home_address = Service._formatAddress(application.applicant, 'home_address')
    mailing_address = Service._formatAddress(application.applicant, 'mailing_address')
    _.merge sfApp.primaryApplicant, home_address
    _.merge sfApp.primaryApplicant, mailing_address
    if Service.showVeteransApplicationQuestion() && veteranMemberId && veteranMemberId == application.applicant.id
      sfApp.primaryApplicant.isVeteran = 'Yes'
    else if Service.showVeteransApplicationQuestion()
      sfApp.primaryApplicant.isVeteran = null
    # householdMembers
    householdMembers = Service._formatHouseholdMembers(application, veteranMemberId)
    unless _.isEmpty(householdMembers)
      sfApp.householdMembers = householdMembers

    # Veterans Preference is different from other preferences, the backend needs to know who is a veteran in the householdMember/primaryApplicant object
    if Service.showVeteransApplicationQuestion() && (application.isAnyoneAVeteran == 'No' || application.isAnyoneAVeteran == 'Decline to state' || application.isAnyoneAVeteran == null)
      allAppMembers = _.concat(sfApp.primaryApplicant, sfApp.householdMembers)
      _.each(allAppMembers, (member) ->
        if member
          member.isVeteran = application.isAnyoneAVeteran
      )

    # add other data
    sfApp.adaPrioritiesSelected = Service._formatPickList(application.adaPrioritiesSelected)
    sfApp.referral = application.applicant.referral
    sfApp.agreeToTerms = !!application.applicant.terms.yes

    # income
    sfApp.householdVouchersSubsidies = Service._formatBoolean(application.householdVouchersSubsidies)
    _.merge sfApp, Service._formatIncome(application.householdIncome)
    sfApp.totalMonthlyRent = Service._calculateTotalMonthlyRent(application)
    sfApp.formMetadata = Service._formatMetadata(application)

    # custom educator
    sfApp.primaryApplicant.isSFUSDEmployee = application.customEducatorScreeningAnswer
    sfApp.primaryApplicant.jobClassification = application.customEducatorJobClassificationNumber

    # add the HCBS answer to the priorities object, so that it appears with priorities in the Leasing Agent Portal
    if application.hasHomeAndCommunityBasedServices == 'Yes' && sfApp.adaPrioritiesSelected == 'None;'
      sfApp.adaPrioritiesSelected = ListingConstantsService.HCBS_PRIORITY_NAME + ';'
    else if application.hasHomeAndCommunityBasedServices == 'Yes'
      sfApp.adaPrioritiesSelected += ListingConstantsService.HCBS_PRIORITY_NAME + ';'

    # add preferences and return
    sfApp.shortFormPreferences = Service._formatPreferences(application)
    return sfApp

  Service.formatUserDOB = (user) ->
    dob_fields = _.compact [user.dob_year, user.dob_month, user.dob_day]
    return null unless dob_fields.length == 3
    dob_string = dob_fields.join('-')
    # ensure padded zeroes e.g. 01-01-1980
    moment(dob_string, "YYYY-MM-DD").format("YYYY-MM-DD")

  Service.removeDOBFields = (user) ->
    _.omit user, ['dob_day', 'dob_month', 'dob_year']

  ######### "private" methods

  Service._formatAddress = (member, addressType, opts = {}) ->
    return unless member[addressType]
    addressData = {}

    if addressType == 'home_address'
      _.forEach member[addressType], (value, key) ->
        if !_.includes(['address1', 'address2', 'boundary_match'], key)
          addressData[key] = value
        return
      if member[addressType].address1
        addressData.address = member[addressType].address1
        address2 = member[addressType].address2
        addressData.address += ' ' + address2 if address2

    else if addressType == 'mailing_address'
      _.forEach member[addressType], (value, key) ->
        if !_.includes(['address1', 'address2', 'boundary_match'], key)
          newKey = 'mailing' + _.capitalize(key)
          addressData[newKey] = value
        return
      addressData.mailingAddress = member[addressType].address1
      address2 = member[addressType].address2
      addressData.mailingAddress += ' ' + address2 if address2

    if opts.householdMember
      addressData.hasSameAddressAsApplicant = Service._formatBoolean(member.hasSameAddressAsApplicant)

    return addressData

  Service._formatHouseholdMembers = (application, veteranMemberId) ->
    householdMembers = []
    members = _.each application.householdMembers, (member) ->
      householdMember = _.pick member, Service.WHITELIST_FIELDS.householdMember
      householdMember.dob = Service.formatUserDOB(member)
      householdMember.workInSf = Service._formatBoolean(member.workInSf)
      _.merge householdMember, Service._formatGeocodingData(member)
      home_address = Service._formatAddress(member, 'home_address', {householdMember: true})
      _.merge householdMember, home_address
      if Service.showVeteransApplicationQuestion() && veteranMemberId && veteranMemberId == member.id
        householdMember.isVeteran = 'Yes'
      else if Service.showVeteransApplicationQuestion()
        householdMember.isVeteran = null
      householdMembers.push(householdMember)
    return householdMembers

  Service._formatPreferences = (application) ->
    shortFormPreferences = []
    allMembers = angular.copy(application.householdMembers)
    allMembers.push(application.applicant)
    PREFS = ListingDataService.preferenceMap
    appPrefs = application.preferences

    angular.copy(ListingDataService.listing.preferences).forEach( (listingPref) ->
      # prefKey is the short name like liveInSf
      prefKey = null
      naturalKey = null
      individualPref = null
      optOut = false
      shortformPreferenceID = null
      certificateNumber = null
      proofOption = null
      address = null
      city = null
      state = null
      zip = null
      if listingPref.preferenceName == PREFS.liveWorkInSf
        shortformPreferenceID = appPrefs.liveWorkInSf_shortformPreferenceID
        # default prefKey and optOut for Live/Work, in case individual live or work
        # preference isn't applicable (like when applicant is eligible for both, but
        # opts out of preference all together)
        prefKey = 'liveWorkInSf'
        optOut = appPrefs.optOut.liveWorkInSf
        if appPrefs.liveInSf || appPrefs.optOut.liveInSf
          individualPref = 'Live in SF'
          prefKey = 'liveInSf'
          optOut = appPrefs.optOut.liveInSf
        else if appPrefs.workInSf || appPrefs.optOut.workInSf
          individualPref = 'Work in SF'
          prefKey = 'workInSf'
          optOut = appPrefs.optOut.workInSf
        proof = appPrefs.documents[prefKey] || {}
        proofOption = proof.proofOption unless optOut
      else if listingPref.preferenceName == PREFS.rentBurden
        shortformPreferenceID = appPrefs.rentBurden_shortformPreferenceID
        if appPrefs.rentBurden || appPrefs.optOut.rentBurden
          individualPref = 'Rent Burdened'
          prefKey = 'rentBurden'
          optOut = appPrefs.optOut.rentBurden
        else if appPrefs.assistedHousing || appPrefs.optOut.assistedHousing
          individualPref = 'Assisted Housing'
          prefKey = 'assistedHousing'
          optOut = appPrefs.optOut.assistedHousing
        proofOption = 'Lease and rent proof' unless optOut
      else
        prefKey = _.invert(PREFS)[listingPref.preferenceName]
        prefKey = listingPref.listingPreferenceID if !prefKey
        shortformPreferenceID = appPrefs["#{prefKey}_shortformPreferenceID"]
        optOut = appPrefs.optOut[prefKey]
        proof = appPrefs.documents[prefKey] || {}
        proofOption = proof.proofOption unless optOut
        # pref_certificateNumber may or may not exist, which is ok
        certificateNumber = appPrefs["#{prefKey}_certificateNumber"]
        prefAddress = appPrefs[prefKey + '_address']
        # If the preference (e.g. for 588 mission) has an individual preference, add it
        individualPref = appPrefs[prefKey + '_preference']

      if prefAddress
        address = prefAddress.address1
        address += " " + prefAddress.address2 if prefAddress.address2
        city = prefAddress.city
        state = prefAddress.state
        zip = prefAddress.zip

      # if you optOut then you wouldn't have a memberName or proofOption
      unless optOut
        memberId = appPrefs[prefKey + '_household_member']
        member = _.find(allMembers, { id: memberId })

        if !member && prefKey == 'rentBurden'
          # set a default member in the case of rentBurden where none was indicated
          member = application.applicant

        if member
          # there might not be a member indicated if it's a draft
          naturalKey = "#{member.firstName},#{member.lastName},#{Service.formatUserDOB(member)}"

      shortFormPref = {
        shortformPreferenceID
        recordTypeDevName: Service._getPreferenceRecordType(listingPref)
        listingPreferenceID: listingPref.listingPreferenceID
        preferenceProof: proofOption
        individualPreference: individualPref
        naturalKey
        optOut
        certificateNumber
        address
        city
        state
        zip
      }
      # remove blank values
      shortFormPref = _.omitBy(shortFormPref, _.isNil)
      shortFormPreferences.push(shortFormPref)
    )

    return shortFormPreferences

  Service._getPreferenceRecordType = (preference) ->
    return preference.recordTypeDevName if preference.recordTypeDevName
    PREFS = ListingDataService.preferenceMap
    prefName = preference.preferenceName
    switch
      when prefName is PREFS.certOfPreference
        'COP'
      when prefName in (PREFS[key] for key in ListingConstantsService.rightToReturnPreferences)
        'AG'
      when prefName is PREFS.displaced
        'DTHP'
      when (prefName is PREFS.liveWorkInSf || prefName is PREFS.liveInSf || prefName is PREFS.workInSf)
        'L_W'
      when prefName is PREFS.neighborhoodResidence
        'NRHP'
      when (prefName is PREFS.assistedHousing || prefName is PREFS.rentBurden)
        'RB_AHP'
      when prefName is PREFS.antiDisplacement
        'ADHP'
      else 'Custom'

  Service._formatPickList = (listData) ->
    resultStr = ""
    _.each listData, (value, key) ->
      resultStr += (key + ";") if value
      return
    return resultStr

  Service._formatIncome = (householdIncome) ->
    incomeData = {}
    if householdIncome.incomeTimeframe == 'per_year'
      incomeData.annualIncome = householdIncome.incomeTotal
    else if householdIncome.incomeTimeframe == 'per_month'
      incomeData.monthlyIncome = householdIncome.incomeTotal
    return incomeData

  Service._formatBoolean = (value) ->
    # the point is to return true/false or null if no value provided
    if value == 'Yes'
      true
    else if value == 'No'
      false
    else
      null

  Service._calculateTotalMonthlyRent = (application) ->
    # _.sumBy will count any `null` or `undefined` values as 0
    _.sumBy(application.groupedHouseholdAddresses, 'monthlyRent')

  Service._formatGeocodingData = (member) ->
    data = {}
    if member.geocodingData
      geo = member.geocodingData
      if geo.location
        data.xCoordinate = geo.location.x
        data.yCoordinate = geo.location.y
      if geo.attributes
        data.whichComponentOfLocatorWasUsed = geo.attributes.Loc_name
      data.candidateScore = geo.score
    return data

  # turn all metaFields into a formMetadata JSON string
  Service._formatMetadata = (application) ->
    JSON.stringify(_.pick(application, Service.metaFields))

  #############################################
  # Reverse formatting functions (Salesforce -> Web app)
  #############################################

  Service.reformatApplication = (sfApp = {}, uploadedFiles = []) ->
    data = _.pick sfApp, Service.WHITELIST_FIELDS.application
    data.lotteryNumber = sfApp.lotteryNumber
    data.listing = sfApp.listing
    data.alternateContact = Service._reformatAltContact(sfApp.alternateContact)
    data.applicant = Service._reformatPrimaryApplicant(sfApp.primaryApplicant, sfApp.alternateContact)
    data.adaPrioritiesSelected = Service._reformatMultiSelect(sfApp.adaPrioritiesSelected)
    # FIXME: Since we switched from multi-select to single select in #173721318, we need to make sure we only get one value.
    data.applicant.referral = sfApp.referral
    data.householdMembers = Service._reformatHousehold(sfApp.householdMembers)
    data.householdVouchersSubsidies = Service._reformatBoolean(sfApp.householdVouchersSubsidies)
    data.householdIncome = Service._reformatIncome(sfApp)
    data.documents = Service._reformatDocuments(uploadedFiles)
    Service._reformatMetadata(sfApp, data)

    # custom educator
    data.customEducatorScreeningAnswer = sfApp.primaryApplicant.isSFUSDEmployee
    data.customEducatorJobClassificationNumber = sfApp.primaryApplicant.jobClassification

    if !!data.adaPrioritiesSelected[ListingConstantsService.HCBS_PRIORITY_NAME]
      delete data.adaPrioritiesSelected[ListingConstantsService.HCBS_PRIORITY_NAME]
      data.hasHomeAndCommunityBasedServices = 'Yes'
    else
      data.hasHomeAndCommunityBasedServices = 'No'

    allHousehold = angular.copy(data.householdMembers)
    allHousehold.unshift(data.applicant)
    data.preferences = Service._reformatPreferences(sfApp, data, allHousehold, uploadedFiles)

    # Veterans Preference is different from other preferences, the backend needs to know who is a veteran in the householdMember/primaryApplicant object
    if Service.showVeteransApplicationQuestion()
      veteranMemberId = null
      allAppMembers = _.concat(data.applicant, data.householdMembers)
      veteranMember = _.find(allAppMembers, { isVeteran: 'Yes' })
      if veteranMember
        data.preferences.veterans_household_member = veteranMember.id.toString()
        data.isAnyoneAVeteran = 'Yes'
      else if _.find(allAppMembers, { isVeteran: 'No' })
        data.isAnyoneAVeteran = 'No'
      else if _.find(allAppMembers, { isVeteran: 'Decline to state' })
        data.isAnyoneAVeteran = 'Decline to state'

    # if sfApp.autofill == true that means the API returned an autofilled application
    # to be used as a new draft (i.e. some fields need to be cleared out)
    Service._autofillReset(data) if sfApp.autofill
    return data

  Service.reformatDOB = (dob = '') ->
    return null unless dob
    split = dob.split('-')
    return {
      dob_year: parseInt(split[0])
      dob_month: parseInt(split[1])
      dob_day: parseInt(split[2])
    }

  Service._reformatDocuments = (uploadedFiles) ->
    files = {}
    return files unless _.isArray(uploadedFiles)
    uploadedFiles.forEach (file) ->
      if file.listing_preference_id == null
        files[file.document_type] = {
          proofOption: file.document_type
          file: file
        }
    files


  Service._reformatAltContact = (alternateContact) ->
    # autofill logic in Rails will set appMemberId to null
    if !alternateContact || _.isEqual(alternateContact, { appMemberId: null })
      return { alternateContactType: 'None' }
    contact = _.pick alternateContact, Service.WHITELIST_FIELDS.alternateContact
    contact.mailing_address = Service._reformatMailingAddress(alternateContact)
    return contact

  # Convert from Salesforce back to DAHLIA format
  Service._reformatPrimaryApplicant = (contact, altContact) ->
    applicant = _.pick contact, Service.WHITELIST_FIELDS.primaryApplicant
    applicant.mailing_address = Service._reformatMailingAddress(contact)
    applicant.home_address = Service._reformatHomeAddress(contact)
    applicant.workInSf = Service._reformatBoolean(contact.workInSf)
    applicant.additionalPhone = !! contact.alternatePhone
    # we use this tempId to identify people in the preference dropdown
    applicant.id = 1
    _.merge(applicant, Service.reformatDOB(contact.DOB))

    return applicant

  Service._reformatHousehold = (contacts) ->
    household = []
    i = 1
    contacts.forEach (contact) ->
      i++
      member = Service._reformatHouseholdMember(contact)
      # still need these tempIds just to make the form work for editing
      member.id = i
      household.push(member)
    household

  Service._reformatHouseholdMember = (contact) ->
    member = _.pick contact, Service.WHITELIST_FIELDS.householdMember
    member.home_address = Service._reformatHomeAddress(contact)
    member.hasSameAddressAsApplicant = Service._reformatBoolean(contact.hasSameAddressAsApplicant)
    member.workInSf = Service._reformatBoolean(contact.workInSf)
    _.merge(member, Service.reformatDOB(contact.DOB))
    return member

  Service._initPreferences = (data) ->
    data.preferences = {
      optOut: {}
      documents: {
        rentBurden: {}
      }
    }
    _.each data.groupedHouseholdAddresses, (groupedHouseholdAddress) ->
      Service.initRentBurdenDocs(groupedHouseholdAddress.address, data)

    data.preferences

  Service._reformatPreferences = (sfApp, data, allHousehold, files) ->
    preferences = Service._initPreferences(data)
    shortFormPrefs = angular.copy(sfApp.shortFormPreferences) || []
    shortFormPrefs.forEach( (shortFormPref) ->
      listing = sfApp.listing || ListingDataService.listing
      listingPref = ListingPreferenceService.getPreferenceById(shortFormPref.listingPreferenceID, listing)
      # if we don't find a matching listing preference that's probably bad.
      return unless listingPref

      member = _.find(allHousehold, {appMemberId: shortFormPref.appMemberID})
      isCustom = false
      # lookup the short preferenceKey from the long name (e.g. lookup "certOfPreference")
      if listingPref.preferenceName == ListingDataService.preferenceMap.liveWorkInSf
        preferences.liveWorkInSf_shortformPreferenceID = shortFormPref.shortformPreferenceID
        if shortFormPref.individualPreference == 'Live in SF'
          prefKey = 'liveInSf'
        else if shortFormPref.individualPreference == 'Work in SF'
          prefKey = 'workInSf'
        else
          prefKey = 'liveWorkInSf'
      else if listingPref.preferenceName == ListingDataService.preferenceMap.rentBurden
        preferences.rentBurden_shortformPreferenceID = shortFormPref.shortformPreferenceID
        if shortFormPref.individualPreference == 'Assisted Housing'
          prefKey = 'assistedHousing'
        else if shortFormPref.individualPreference == 'Rent Burdened'
          prefKey = 'rentBurden'
      else
        prefKey = _.invert(ListingDataService.preferenceMap)[listingPref.preferenceName]
        unless prefKey
          # must be a customPreference... just identify by ID much like on e7b-custom-preferences
          prefKey = listingPref.listingPreferenceID
          isCustom = true
        preferences["#{prefKey}_shortformPreferenceID"] = shortFormPref.shortformPreferenceID

      preferences.optOut[prefKey] = shortFormPref.optOut
      unless shortFormPref.optOut
        # now that we have prefKey, reconstruct the fields on preferences
        if member
          preferences["#{prefKey}_household_member"] = member.id
          preferences[prefKey] = true

        if shortFormPref.certificateNumber
          preferences["#{prefKey}_certificateNumber"] = shortFormPref.certificateNumber

        if shortFormPref.address || shortFormPref.city || shortFormPref.state || shortFormPref.zip
          preferences["#{prefKey}_address"] = {
            address1: shortFormPref.address
            city: shortFormPref.city
            state: shortFormPref.state
            zip: shortFormPref.zip
          }
        # If a custom pref (e.g. 588 mission), add individualPreference if present
        if shortFormPref.individualPreference && isCustom
            preferences["#{prefKey}_preference"] = shortFormPref.individualPreference
        preferences = Service._reformatPreferenceProof(preferences, prefKey, shortFormPref, files, sfApp.status)

    )

    if preferences.liveInSf || preferences.workInSf
      preferences.liveWorkInSf = true
      preferences.liveWorkInSf_preference = if preferences.liveInSf then 'liveInSf' else 'workInSf'
    preferences

  Service._reformatPreferenceProof = (preferences, prefKey, shortFormPref, files, status) ->
    if status.match(/draft/i)
      _.each _.filter(files, {listing_preference_id: shortFormPref.listingPreferenceID}), (file) ->
        # mark preference as true if they've uploaded any files (e.g. for a draft)
        preferences[prefKey] = true

        if prefKey == 'rentBurden'
          if !_.isEmpty(preferences.documents.rentBurden[file.address])
            if file.rent_burden_type == 'lease'
              preferences.documents.rentBurden[file.address].lease = {
                proofOption: file.document_type
                file: file
              }
            else
              preferences.documents.rentBurden[file.address].rent[file.rent_burden_index] = {
                id: file.rent_burden_index
                proofOption: file.document_type
                file: file
              }
        else
          preferences.documents[prefKey] = {
            proofOption: file.document_type
            file: file
          }
    else
      preferences.documents[prefKey] = {
        proofOption: shortFormPref.preferenceProof
      }
    return preferences

  Service._reformatMailingAddress = (contact) ->
    return {
      address1: contact.mailingAddress
      city: contact.mailingCity
      state: contact.mailingState
      zip: contact.mailingZip
    }

  Service._reformatHomeAddress = (contact) ->
    return {
      address1: contact.address
      city: contact.city
      state: contact.state
      zip: contact.zip
    }

  Service._reformatIncome = (sfApp) ->
    if sfApp.monthlyIncome
      return {
        incomeTimeframe: 'per_month'
        incomeTotal: sfApp.monthlyIncome
      }
    else if sfApp.annualIncome
      return {
        incomeTimeframe: 'per_year'
        incomeTotal: sfApp.annualIncome
      }

  Service._reformatMultiSelect = (option = '') ->
    keys = _.compact option.split(';')
    _.zipObject keys, _.fill(new Array(keys.length), true)

  Service._reformatBoolean = (bool) ->
    if bool == 'true'
      'Yes'
    else if bool == 'false'
      'No'

  Service._reformatMetadata = (sfApp, data) ->
    formMetadata = JSON.parse(sfApp.formMetadata)
    return if _.isEmpty(formMetadata)
    metadata = _.pick(formMetadata, Service.metaFields)
    _.merge(data, metadata)

  Service.initRentBurdenDocs = (address, data) ->
    rentBurdenDocs = data.preferences.documents.rentBurden
    return if !_.isEmpty(rentBurdenDocs[address])
    rentBurdenDocs[address] = {
      lease: {}
      rent: {}
    }

  Service._autofillReset = (data) ->
    # If referral contains more than one option, reset it to work with single select.
    if data?.applicant?.referral and ';' in data.applicant.referral
      data.applicant.referral = null

    # reset fields that don't apply to this application
    LS = ListingDataService
    LCS = ListingConstantsService
    unless ListingPreferenceService.hasPreference('assistedHousing', LS.listing)
      delete data.hasPublicHousing
      delete data.totalMonthlyRent
      data.groupedHouseholdAddresses = []
    unless ListingUnitService.listingHasReservedUnitType(LS.listing, LCS.RESERVED_TYPES.VETERAN)
      delete data.hasMilitaryService
    unless ListingUnitService.listingHasReservedUnitType(LS.listing, LCS.RESERVED_TYPES.DISABLED)
      delete data.hasDevelopmentalDisability

    # reset contact + neighborhood data
    resetContactFields = [
      'appMemberId'
      'contactId'
      'preferenceAddressMatch'
      'xCoordinate'
      'yCoordinate'
      'whichComponentOfLocatorWasUsed'
      'candidateScore'
    ]
    angular.copy(_.omit(data.applicant, resetContactFields), data.applicant)
    _.each data.householdMembers, (member) ->
      angular.copy(_.omit(member, resetContactFields), member)

    # reset completedSections
    angular.copy(Service.defaultCompletedSections, data.completedSections)

  #############################################
  # Helper functions
  #############################################

  Service.DOBValid = (field = 'day', values) ->
    month = values.month
    day = values.day
    year = values.year
    # allow valid year for the "unborn baby" rule, which is checked more precisely in
    # ShortFormApplicationController.householdMemberValidAge
    validYear = moment().add(10, 'months').year()
    switch field
      when 'day'
        day >= 1 && day <= Service.maxDOBDay(month, year)
      when 'month'
        month >= 1 && month <= 12
      when 'year'
        year >= 1900 && year <= validYear

  # FIXME: this will fail in the year 2100
  Service.maxDOBDay = (month, year) ->
    month = parseInt(month)
    year = parseInt(year)
    max = 31
    if month == 2
      max = if (year % 4 == 0) then 29 else 28
    else if _.includes([4, 6, 9, 11], month)
      max = 30
    return max

  Service.DOBtoMoment = (year, month, day) ->
    return false unless month && day && year >= 1900
    moment("#{year}-#{month}-#{day}", 'YYYY-MM-DD')

  Service.DOBtoAge = (dobMoment) ->
    return unless dobMoment
    moment().diff(dobMoment, 'years')

  return Service

#############################################

ShortFormDataService.$inject = [
  'ListingDataService',
  'ListingConstantsService',
  'ListingPreferenceService',
  'ListingUnitService',
  'SharedService'
]

angular
  .module('dahlia.services')
  .service('ShortFormDataService', ShortFormDataService)
