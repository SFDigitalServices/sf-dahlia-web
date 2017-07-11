ShortFormDataService = (ListingService) ->
  Service = {}
  Service.preferences = _.keys(ListingService.preferenceMap)
  Service.metaFields = [
    'completedSections'
    'session_uid'
    'groupedHouseholdAddresses'
  ]

  Service.formatApplication = (listingId, shortFormApplication) ->
    application = angular.copy(shortFormApplication)
    application.listingID = listingId
    application = Service._formatDOB(application)
    application = Service._formatAddress(application, 'applicant', 'home_address')
    application = Service._formatAddress(application, 'applicant', 'mailing_address')
    application = Service._formatGeocodingData(application)
    noAltContact =
      application.alternateContact.alternateContactType == 'None' ||
      !application.alternateContact.firstName ||
      !application.alternateContact.lastName
    if noAltContact
      delete application.alternateContact
    else
      application = Service._formatAddress(application, 'alternateContact', 'mailing_address')
    application = Service._formatHouseholdAddress(application)
    application = Service._formatHouseholdDOB(application)
    application = Service._formatPreferences(application)
    application = Service._formatPrioritiesSelected(application)
    application = Service._formatReferrals(application)
    application = Service._formatTerms(application)
    application = Service._formatIncome(application)
    application = Service._formatBooleans(application)
    application = Service._renameApplicant(application)
    application = Service._calculateTotalMonthlyRent(application)
    application = Service._formatMetadata(application)
    delete application.householdMembers if _.isEmpty(application.householdMembers)
    delete application.primaryApplicant.mailingGeocoding_data
    delete application.validatedForms
    delete application.lotteryNumber
    delete application.autofill
    delete application.surveyComplete
    return application

  Service.formatUserDOB = (user) ->
    dob_fields = _.compact [user.dob_year, user.dob_month, user.dob_day]
    return null unless dob_fields.length == 3
    dob_string = dob_fields.join('-')
    # ensure padded zeroes e.g. 01-01-1980
    moment(dob_string, "YYYY-MM-DD").format("YYYY-MM-DD")

  Service.removeDOBFields = (user) ->
    _.omit user, ['dob_day', 'dob_month', 'dob_year']

  ######### "private" methods

  Service._renameApplicant = (application) ->
    application.primaryApplicant = angular.copy(application.applicant)
    delete application.applicant
    return application

  Service._formatDOB = (application) ->
    application.applicant.dob = Service.formatUserDOB(application.applicant)
    application.applicant = Service.removeDOBFields(application.applicant)
    return application

  Service._formatHouseholdDOB = (application) ->
    application.householdMembers.forEach( (member) ->
      member.dob = Service.formatUserDOB(member)
      angular.copy(Service.removeDOBFields(member), member)
      return
    )
    return application


  Service._formatAddress = (application, person, addressType) ->
    delete application[person].geocoding_data
    return application unless application[person][addressType]

    if addressType == 'home_address'
      _.forEach application[person][addressType], (value, key) ->
        if !_.includes(['address1', 'address2', 'boundary_match'], key)
          application[person][key] = value
        return
      if application[person][addressType].address1
        application[person].address = application[person][addressType].address1
        address2 = application[person][addressType].address2
        application[person].address += ' ' + address2 if address2
      delete application[person].confirmed_home_address

    else if addressType == 'mailing_address'
      _.forEach application[person][addressType], (value, key) ->
        if !_.includes(['address1', 'address2', 'boundary_match'], key)
          newKey = 'mailing' + _.capitalize(key)
          application[person][newKey] = value
        return
      application[person].mailingAddress = application[person][addressType].address1
      address2 = application[person][addressType].address2
      application[person].mailingAddress += ' ' + address2 if address2

    delete application[person][addressType]
    return application

  Service._formatHouseholdAddress = (application) ->
    application.householdMembers.forEach( (member) ->
      if member.home_address
        _.forEach member.home_address, (value, key) ->
          if !_.includes(['address1', 'address2', 'boundary_match'], key)
            member[key] = value
          return
        member.address = member.home_address.address1
        member.address += ' ' + member.home_address.address2 if member.home_address.address2

      if member.hasSameAddressAsApplicant == 'Yes'
        member.hasSameAddressAsApplicant = true
      else
        member.hasSameAddressAsApplicant = false

      delete member.home_address
      delete member.confirmed_home_address
      delete member.geocoding_data
    )
    return application

  Service._formatPreferences = (application) ->
    application.shortFormPreferences = []
    allMembers = angular.copy(application.householdMembers)
    allMembers.push(application.applicant)

    angular.copy(ListingService.listing.preferences).forEach( (listingPref) ->
      # prefKey is the short name like liveInSf
      prefKey = null
      naturalKey = null
      individualPref = null
      optOut = false
      shortformPreferenceID = null
      appPrefs = application.preferences

      if listingPref.preferenceName == ListingService.preferenceMap.liveWorkInSf
        shortformPreferenceID = appPrefs.liveWorkInSf_shortformPreferenceID
        optOut = appPrefs.optOut.liveWorkInSf
        if appPrefs.liveInSf || appPrefs.optOut.liveInSf
          individualPref = 'Live in SF'
          prefKey = 'liveInSf'
          optOut = appPrefs.optOut.liveInSf
        else if appPrefs.workInSf || appPrefs.optOut.workInSf
          individualPref = 'Work in SF'
          prefKey = 'workInSf'
          optOut = appPrefs.optOut.workInSf
      else if listingPref.preferenceName == ListingService.preferenceMap.rentBurden
        shortformPreferenceID = appPrefs.rentBurden_shortformPreferenceID
        if appPrefs.rentBurden || appPrefs.optOut.rentBurden
          individualPref = 'Rent Burdened'
          prefKey = 'rentBurden'
          optOut = appPrefs.optOut.rentBurden
        else if appPrefs.assistedHousing || appPrefs.optOut.assistedHousing
          individualPref = 'Assisted Housing'
          prefKey = 'assistedHousing'
          optOut = appPrefs.optOut.assistedHousing
      else
        prefKey = _.invert(ListingService.preferenceMap)[listingPref.preferenceName]
        shortformPreferenceID = appPrefs["#{prefKey}_shortformPreferenceID"]
        optOut = appPrefs.optOut[prefKey]

      # if you optOut then you wouldn't have a memberName or proofOption
      unless optOut
        memberId = appPrefs[prefKey + '_household_member']
        member = _.find(allMembers, { id: memberId })

        if !member && prefKey == 'rentBurden'
          # set a default member in the case of rentBurden where none was indicated
          member = application.applicant

        if member
          # there might not be a member indicated if it's a draft
          naturalKey = "#{member.firstName},#{member.lastName},#{member.dob}"

      shortFormPref =
        shortformPreferenceID: shortformPreferenceID
        listingPreferenceID: listingPref.listingPreferenceID
        naturalKey: naturalKey
        optOut: optOut
        ifCombinedIndividualPreference: individualPref
      # remove blank values
      shortFormPref = _.omitBy(shortFormPref, _.isNil)
      application.shortFormPreferences.push(shortFormPref)
    )
    # ensure we don't send combo prefs (e.g. assistedHousing / rentBurden) twice
    application.shortFormPreferences = _.uniqBy(application.shortFormPreferences, 'listingPreferenceID')
    delete application.preferences
    return application

  Service._formatPrioritiesSelected = (application) ->
    prioritiesSelected = ""
    _.forEach application.adaPrioritiesSelected, (value, key) ->
      prioritiesSelected += (key + ";") if value
      return
    application.adaPrioritiesSelected = prioritiesSelected
    return application

  Service._formatReferrals = (application) ->
    referrals = ""
    _.forEach application.applicant.referral, (value, key) ->
      referrals += (key + ";") if value
      return
    application.referral = referrals
    delete application.applicant.referral
    return application

  Service._formatTerms = (application) ->
    if application.applicant.terms.yes
      application.agreeToTerms = true
    else
      application.agreeToTerms = false
    delete application.applicant.terms
    return application

  Service._formatIncome = (application) ->
    incomeTimeframe = application.householdIncome.incomeTimeframe
    if incomeTimeframe == 'per_year'
      application.annualIncome = application.householdIncome.incomeTotal
    else if incomeTimeframe == 'per_month'
      application.monthlyIncome = application.householdIncome.incomeTotal
    delete application.householdIncome
    return application

  Service._formatBooleans = (application) ->
    if application.householdVouchersSubsidies == 'Yes'
      application.householdVouchersSubsidies = true
    else if application.householdVouchersSubsidies == 'No'
      application.householdVouchersSubsidies = false

    ['workInSf', 'hiv'].forEach (field) ->
      if application.applicant[field] == 'Yes'
        application.applicant[field] = true
      else if application.applicant[field] == 'No'
        application.applicant[field] = false

    application.householdMembers.forEach( (member) ->
      if member.workInSf == 'Yes'
        member.workInSf = true
      else if member.workInSf == 'No'
        member.workInSf = false
    )
    return application

  Service._calculateTotalMonthlyRent = (application) ->
    # _.sumBy will count any `null` or `undefined` values as 0
    application.totalMonthlyRent = _.sumBy(application.groupedHouseholdAddresses, 'monthlyRent')
    return application

  Service._formatGeocodingData = (application) ->
    members = application.householdMembers.concat([application.applicant])
    members.forEach (member) ->
      if member.geocodingData
        geo = member.geocodingData
        if geo.location
          member.xCoordinate = geo.location.x
          member.yCoordinate = geo.location.y
        if geo.attributes
          member.whichComponentOfLocatorWasUsed = geo.attributes.loc_name
        member.candidateScore = geo.score
        delete member.geocodingData
    return application

  Service._formatMetadata = (application) ->
    formMetadata =
      completedSections: application.completedSections
      session_uid: application.session_uid

  # move all metaFields off the application object and into formMetadata JSON string
  Service._formatMetadata = (application) ->
    application.formMetadata = JSON.stringify(_.pick(application, Service.metaFields))
    _.each Service.metaFields, (metaField) ->
      delete application[metaField]
    return application

  #############################################
  # Reverse formatting functions (Salesforce -> Web app)
  #############################################

  Service.reformatApplication = (sfApp = {}, uploadedFiles = []) ->
    whitelist = [
      'id'
      'listingID'
      'listing'
      'applicationSubmittedDate'
      'status'
      'lotteryNumber',
      'autofill'
      'hasPublicHousing'
      'hasMilitaryService'
      'hasDevelopmentalDisability'
      'answeredCommunityScreening'
    ]
    data = _.pick sfApp, whitelist
    data.alternateContact = Service._reformatAltContact(sfApp.alternateContact)
    data.applicant = Service._reformatPrimaryApplicant(sfApp.primaryApplicant, sfApp.alternateContact)
    data.adaPrioritiesSelected = Service._reformatMultiSelect(sfApp.adaPrioritiesSelected)
    data.applicant.referral = Service._reformatMultiSelect(sfApp.referral)
    data.householdMembers = Service._reformatHousehold(sfApp.householdMembers)
    data.householdVouchersSubsidies = Service._reformatBoolean(sfApp.householdVouchersSubsidies)
    data.householdIncome = Service._reformatIncome(sfApp)
    Service._reformatMetadata(sfApp, data)
    data.preferences = Service._reformatPreferences(sfApp, data, uploadedFiles)
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

  Service._reformatAltContact = (alternateContact) ->
    return { alternateContactType: 'None' } unless alternateContact
    whitelist = [
      'appMemberId', 'alternateContactType', 'alternateContactTypeOther',
      'agency', 'email', 'firstName', 'lastName', 'phone'
    ]
    contact = _.pick alternateContact, whitelist
    contact.mailing_address = Service._reformatMailingAddress(alternateContact)
    return contact

  Service._reformatPrimaryApplicant = (contact, altContact) ->
    whitelist = [
      'appMemberId', 'contactId',
      'noPhone', 'noEmail', 'noAddress', 'hasAltMailingAddress',
      'email', 'firstName', 'middleName', 'lastName', 'preferenceAddressMatch',
      'phone', 'phoneType', 'alternatePhone', 'alternatePhoneType', 'ethnicity',
      'gender', 'genderOther', 'race', 'sexualOrientation', 'sexualOrientationOther',
      'xCoordinate', 'yCoordinate', 'whichComponentOfLocatorWasUsed', 'candidateScore',
    ]
    applicant = _.pick contact, whitelist
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
    whitelist = [
      'appMemberId', 'firstName', 'middleName', 'lastName',
      'relationship', 'preferenceAddressMatch', 'noAddress',
      'xCoordinate', 'yCoordinate', 'whichComponentOfLocatorWasUsed', 'candidateScore',
    ]
    member = _.pick contact, whitelist
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

  Service._reformatPreferences = (sfApp, data, files) ->
    preferences = Service._initPreferences(data)
    allHousehold = sfApp.householdMembers
    allHousehold.unshift(sfApp.primaryApplicant)
    shortFormPrefs = angular.copy(sfApp.shortFormPreferences) || []
    shortFormPrefs.forEach( (shortFormPref) ->

      listingPref = ListingService.getPreferenceById(shortFormPref.listingPreferenceID)
      # if we don't find a matching listing preference that's probably bad.
      return unless listingPref

      member = _.find(allHousehold, {appMemberId: shortFormPref.appMemberID})

      # lookup the short preferenceKey from the long name (e.g. lookup "certOfPreference")
      if listingPref.preferenceName == ListingService.preferenceMap.liveWorkInSf
        preferences.liveWorkInSf_shortformPreferenceID = shortFormPref.shortformPreferenceID
        if shortFormPref.ifCombinedIndividualPreference == 'Live in SF'
          prefKey = 'liveInSf'
        else if shortFormPref.ifCombinedIndividualPreference == 'Work in SF'
          prefKey = 'workInSf'
        else
          prefKey = 'liveWorkInSf'
      else if listingPref.preferenceName == ListingService.preferenceMap.rentBurden
        preferences.rentBurden_shortformPreferenceID = shortFormPref.shortformPreferenceID
        if shortFormPref.ifCombinedIndividualPreference == 'Assisted Housing'
          prefKey = 'assistedHousing'
        else if shortFormPref.ifCombinedIndividualPreference == 'Rent Burdened'
          prefKey = 'rentBurden'
      else
        prefKey = _.invert(ListingService.preferenceMap)[listingPref.preferenceName]
        preferences["#{prefKey}_shortformPreferenceID"] = shortFormPref.shortformPreferenceID

      preferences.optOut[prefKey] = shortFormPref.optOut
      unless shortFormPref.optOut
        # now that we have prefKey, reconstruct the fields on preferences
        if member
          preferences["#{prefKey}_household_member"] = member.id
          preferences[prefKey] = true

        _.each _.filter(files, {listing_preference_id: shortFormPref.listingPreferenceID}), (file) ->
          # mark preference as true if they've uploaded any files (e.g. for a draft)
          preferences[prefKey] = true

          if prefKey == 'rentBurden'
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

    )
    if preferences.liveInSf || preferences.workInSf
      preferences.liveWorkInSf = true
      preferences.liveWorkInSf_preference = if preferences.liveInSf then 'liveInSf' else 'workInSf'
    preferences

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
    else
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
    data.surveyComplete = Service.checkSurveyComplete(data.applicant, {skipReferral: true})
    unless data.surveyComplete
      # clear out demographics if you hadn't already completed them all
      data.applicant.gender = null
      data.applicant.genderOther = null
      data.applicant.ethnicity = null
      data.applicant.race = null
      data.applicant.sexualOrientation = null
      data.applicant.sexualOrientationOther = null
      data.applicant.referral = {}

    # reset fields that don't apply to this application
    LS = ListingService
    unless LS.hasPreference('assistedHousing')
      delete data.hasPublicHousing
      delete data.totalMonthlyRent
      data.groupedHouseholdAddresses = []
    unless LS.listingHasReservedUnitType(LS.listing, LS.RESERVED_TYPES.VETERAN)
      delete data.hasMilitaryService
    unless LS.listingHasReservedUnitType(LS.listing, LS.RESERVED_TYPES.DISABLED)
      delete data.hasDevelopmentalDisability

    # reset contact + neighborhood data
    resetContactFields = [
      'appMemberId'
      'contactId'
      'neighborhoodPreferenceMatch'
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

  Service.checkSurveyComplete = (applicant, opts = {}) ->
    responses = [
      applicant.gender,
      applicant.ethnicity,
      applicant.race,
      applicant.sexualOrientation,
      if opts.skipReferral then true else _.some(applicant.referral),
    ]
    return _.every(responses)

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

  Service.maxDOBDay = (month, year) ->
    month = parseInt(month)
    year = parseInt(year)
    max = 31
    if month == 2
      max = if (year % 4 == 0) then 29 else 28
    else if _.includes([4, 6, 9, 11], month)
      max = 30
    return max


  return Service

#############################################

ShortFormDataService.$inject = [
  'ListingService'
]

angular
  .module('dahlia.services')
  .service('ShortFormDataService', ShortFormDataService)
