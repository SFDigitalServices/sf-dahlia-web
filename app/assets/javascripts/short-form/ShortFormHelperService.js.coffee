ShortFormHelperService = ($translate, $filter, $sce, $state) ->
  Service = {}

  Service.alternate_contact_options = [
    ['Family Member', $translate.instant('LABEL.FAMILY_MEMBER')]
    ['Friend', $translate.instant('LABEL.FRIEND')]
    ['Social Worker or Housing Counselor', $translate.instant('LABEL.SOCIAL_WORKER_OR_HOUSING_COUNSELOR')]
    ['Other', $translate.instant('LABEL.OTHER')]
  ]

  Service.preference_proof_options_default = [
    ['Telephone bill', $translate.instant('LABEL.PROOF.TELEPHONE_BILL')],
    ['Cable and internet bill', $translate.instant('LABEL.PROOF.CABLE_BILL')],
    ['Gas bill', $translate.instant('LABEL.PROOF.GAS_BILL')],
    ['Electric bill', $translate.instant('LABEL.PROOF.ELECTRIC_BILL')],
    ['Garbage bill', $translate.instant('LABEL.PROOF.GARBAGE_BILL')],
    ['Water bill', $translate.instant('LABEL.PROOF.WATER_BILL')],
    ['Paystub', $translate.instant('LABEL.PROOF.PAYSTUB_HOME')],
    ['Public benefits record', $translate.instant('LABEL.PROOF.PUBLIC_BENEFITS')],
    ['School record', $translate.instant('LABEL.PROOF.SCHOOL_RECORD')],
  ]
  Service.preference_proof_options_work = [
    ['Paystub with employer address', $translate.instant('LABEL.PROOF.PAYSTUB_EMPLOYER')],
    ['Letter from employer', $translate.instant('LABEL.PROOF.LETTER_FROM_EMPLOYER')],
  ]
  Service.preference_proof_options_live = angular.copy(Service.preference_proof_options_default)
  Service.preference_proof_options_live.push(
    ['Letter documenting homelessness', $translate.instant('LABEL.PROOF.HOMELESSNESS')],
  )

  Service.preference_proof_options_rent_burden = [
    ['Money order', $translate.instant('LABEL.PROOF.MONEY_ORDER')]
    ['Cancelled check', $translate.instant('LABEL.PROOF.CANCELLED_CHECK')]
    ['Debit from your bank account', $translate.instant('LABEL.PROOF.DEBIT_FROM_BANK')]
    ['Screenshot of online payment', $translate.instant('LABEL.PROOF.ONLINE_PAYMENT')]
  ]

  Service.priority_options = [
    ['Mobility', $translate.instant('LABEL.MOBILITY_IMPAIRMENTS')]
    ['Vision', $translate.instant('LABEL.VISION_IMPAIRMENTS')]
    ['Hearing', $translate.instant('LABEL.HEARING_IMPAIRMENTS')]
  ]

  Service.proofOptions = (preference) ->
    switch preference
      when 'workInSf'
        Service.preference_proof_options_work
      when 'liveInSf'
        Service.preference_proof_options_live
      when 'neighborhoodResidence'
        Service.preference_proof_options_live
      when 'rentBurden'
        Service.preference_proof_options_rent_burden
      else
        Service.preference_proof_options_default


  ## Review Page helpers
  Service.alternateContactRelationship = (alternateContact) ->
    if alternateContact.alternateContactType == 'Other'
      alternateContact.alternateContactTypeOther
    else
      alternateContact.alternateContactType

  Service.applicationVouchersSubsidies = (application) ->
    if application.householdVouchersSubsidies == 'Yes'
      $translate.instant('T.YES')
    else
      $translate.instant('T.NONE')

  Service.applicationIncomeAmount = (application) ->
    income = parseFloat(application.householdIncome.incomeTotal)
    if application.householdIncome.incomeTimeframe == 'per_month'
      phrase = $translate.instant('T.PER_MONTH')
    else
      phrase = $translate.instant('T.PER_YEAR')

    yearly_income = $filter('currency')(income, '$', 2)
    "#{yearly_income} #{phrase}"


  ## Translation Helpers
  Service.applicantFirstName = (applicant) ->
    name = applicant.firstName
    { name: if name then ', ' + name else '' }

  Service.householdMemberForPreference = (application, pref_type) ->
    { user: application.preferences["#{pref_type}_household_member"] }

  Service.fileAttachmentForPreference = (application, pref_type) ->
    return '' if application.status == 'Submitted'
    interpolate = { file: application.preferences.documents[pref_type].proofOption }
    $translate.instant('LABEL.FILE_ATTACHED', interpolate)

  Service.fileAttachmentsForPreference = (application, pref_type) ->
    return '' if application.status == 'Submitted'
    prefDocs = application.preferences.documents[pref_type]
    leaseFileNames = _.map prefDocs, (address) ->
      address.lease.file.name

    rentFiles = _.map prefDocs, (address) -> address.rent
    rentFileNames = _.map rentFiles, (file) ->
      _.values(file)[0].file.name
    _.concat(leaseFileNames, rentFileNames)

  Service.translateLoggedInMessage = (page) ->
    accountSettings =  $translate.instant('ACCOUNT_SETTINGS.ACCOUNT_SETTINGS')
    link = $state.href('dahlia.account-settings')
    markup = null
    if page == 'b1-name'
      nameEditable = $translate.instant('B1_NAME.NAME_EDITABLE_VIA')
      markup = "#{nameEditable} <a href='#{link}'>#{accountSettings}</a>"
    else if page == 'b2-contact'
      nameEditable = $translate.instant('B2_CONTACT.EMAIL_EDITABLE_VIA')
      markup = "#{nameEditable} <a class='lined' href='#{link}'>#{accountSettings}</a>"
    return $sce.trustAsHtml(markup)

  Service.addressTranslateVariable = (address) ->
    { address: address }

  Service.membersTranslationVariable = (members) ->
    { user: $filter('listify')(members, "firstName")}

  Service.youOrHouseholdTranslateVariable = (membersCount, wholeHousehold) ->
    value = if membersCount > 0
      if wholeHousehold then $translate.instant('LABEL.YOUR_HOUSEHOLD') else $translate.instant('LABEL.YOU_OR_ANYONE')
    else
      $translate.instant('LABEL.YOU')
    return {members: value}

  return Service

ShortFormHelperService.$inject = ['$translate', '$filter', '$sce', '$state']

angular
  .module('dahlia.services')
  .service('ShortFormHelperService', ShortFormHelperService)
