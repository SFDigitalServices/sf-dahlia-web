ShortFormDataService = () ->
  Service = {}

  Service.formatApplication = (listingId, shortFormApplication) ->
    application = angular.copy(shortFormApplication)
    application.listingID = listingId
    application = Service._formatDOB(application)
    application = Service._formatAddress(application, 'applicant', 'home_address')
    application = Service._formatAddress(application, 'applicant', 'mailing_address')
    if application.alternateContact.alternateContactType == 'None'
      delete application.alternateContact
    else
      application = Service._formatAddress(application, 'alternateContact', 'mailing_address')
    application = Service._formatHouseholdAddress(application)
    application = Service._formatHouseholdDOB(application)
    application = Service._formatPreferences(application)
    application = Service._formatGenderOptions(application)
    application = Service._formatReferrals(application)
    application = Service._formatTerms(application)
    application = Service._formatIncome(application)
    application = Service._formatBooleans(application)
    application = Service._renameApplicant(application)
    delete application.householdMembers if _.isEmpty(application.householdMembers)
    delete application.primaryApplicant.mailingGeocoding_data
    delete application.completedSections
    delete application.validatedForms
    delete application.lotteryNumber
    return application

  Service.formatUserDOB = (user) ->
    "#{user.dob_year}-#{user.dob_month}-#{user.dob_day}"

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
      member = Service.removeDOBFields(member)
      delete member.id
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
      application[person].address = application[person][addressType].address1 + application[person][addressType].address2
      delete application[person].confirmed_home_address

    else if addressType == 'mailing_address'
      _.forEach application[person][addressType], (value, key) ->
        if !_.includes(['address1', 'address2', 'boundary_match'], key)
          newKey = 'mailing' + _.capitalize(key)
          application[person][newKey] = value
        return
      application[person].mailingAddress = application[person][addressType].address1
      address2 = application[person][addressType].address2
      application[person].mailingAddress += " " + address2 if address2

    delete application[person][addressType]
    return application

  Service._formatHouseholdAddress = (application) ->
    application.householdMembers.forEach( (member) ->
      if member.home_address
        _.forEach member.home_address, (value, key) ->
          if !_.includes(['address1', 'address2', 'boundary_match'], key)
            member[key] = value
          return
        member.address = member.home_address.address1 + member.home_address.address2

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
    preferences = [
        'displaced',
        'certOfPreference',
        'liveInSf',
        'workInSf',
        'neighborhoodResidence'
    ]

    allMembers = angular.copy(application.householdMembers)
    allMembers.push(application.applicant)

    preferences.forEach( (preference) ->
      memberName = application.preferences[preference + '_household_member']
      member = _.find(allMembers, (m) ->
        return memberName == (m.firstName + ' ' + m.lastName)
      )
      return unless member
      memberDOB = member.dob.replace(/\//g, '.')
      if preference == 'certOfPreference'
        preferenceName = preference + 'NatKey'
      else
        preferenceName = preference + 'PreferenceNatKey'
      application[preferenceName] = member.firstName + ',' + member.lastName + ',' + memberDOB
      delete application.preferences[preference + '_household_member']
    )

    if application.householdVouchersSubsidies == 'Yes'
      application.householdVouchersSubsidies = true
    else
      application.householdVouchersSubsidies = false
    delete application.householdVouchersSubsidies
    delete application.preferences
    return application

  Service._formatGenderOptions = (application) ->
    allGenders = ""
    _.forEach application.applicant.gender, (value, key) ->
      allGenders += (key + ";") if value
      return
    application.applicant.gender = allGenders
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
    ['workInSf', 'hiv'].forEach (field) ->
      if application.applicant[field] == 'Yes'
        application.applicant[field] = true
      else
        application.applicant[field] = false

    application.householdMembers.forEach( (member) ->
      if member.workInSf == 'Yes'
        member.workInSf = true
      else
        member.workInSf = false
    )
    return application


  #############################################
  # Reverse formatting functions (Salesforce -> Web app)
  #############################################

  Service.reformatApplication = (sfApp) ->
    data = _.pick sfApp, ['id', 'listingID', 'status']
    data.alternateContact = Service._reformatAltContact(sfApp.alternateContact)
    data.applicant = Service._reformatPrimaryApplicant(sfApp.primaryApplicant)
    return data

  Service._reformatAltContact = (alternateContact) ->
    whitelist = [
      'agency', 'email', 'firstName', 'lastName', 'language', 'languageOther', 'phone'
    ]
    contact = _.pick alternateContact, whitelist
    contact.mailing_address = Service._reformatMailingAddress(alternateContact)
    return contact

  Service._reformatPrimaryApplicant = (contact) ->
    whitelist = [
      'email', 'firstName', 'middleName', 'lastName', 'language', 'languageOther',
      'phone', 'phoneType', 'alternatePhone', 'alternatePhoneType',
    ]
    applicant = _.pick contact, whitelist
    applicant.mailing_address = Service._reformatMailingAddress(contact)
    applicant.home_address = Service._reformatHomeAddress(contact)
    applicant.gender = Service._reformatMultiSelect(contact.gender)
    applicant.dob = Service._reformatMultiSelect(contact.gender)
    _.merge(applicant, Service._reformatDOB(contact.DOB))
    return applicant

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

  Service._reformatMultiSelect = (option = '') ->
    keys = _.compact option.split(';')
    _.zipObject keys, _.fill(new Array(keys.length), true)

  Service._reformatDOB = (dob = '') ->
    return null unless dob
    split = dob.split('-')
    return {
      dob_year: parseInt(split[0])
      dob_month: parseInt(split[1])
      dob_day: parseInt(split[2])
    }




  return Service

#############################################

ShortFormDataService.$inject = []

angular
  .module('dahlia.services')
  .service('ShortFormDataService', ShortFormDataService)
