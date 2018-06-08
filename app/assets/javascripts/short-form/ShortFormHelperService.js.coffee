ShortFormHelperService = ($translate, $filter, $sce, $state) ->
  Service = {}

  # the 't' identity function is purely so that the Gruntfile can know where to look
  # for these translation strings (see customRegex)
  t = (str) -> str

  Service.alternate_contact_options = [
    ['Family Member', t('LABEL.FAMILY_MEMBER')]
    ['Friend', t('LABEL.FRIEND')]
    ['Social Worker or Housing Counselor', t('LABEL.SOCIAL_WORKER_OR_HOUSING_COUNSELOR')]
    ['Other', t('LABEL.OTHER')]
  ]
  Service.gender_options = [
    ['Female', t('LABEL.FEMALE')]
    ['Male', t('LABEL.MALE')]
    ['Genderqueer/Gender Non-binary', t('LABEL.GENDERQUEER_NON_BINARY')]
    ['Trans Female', t('LABEL.TRANS_FEMALE')]
    ['Trans Male', t('LABEL.TRANS_MALE')]
    ['Not Listed', t('LABEL.NOT_LISTED')]
  ]
  Service.sex_at_birth_options = [
    ['Female', t('LABEL.FEMALE')]
    ['Male', t('LABEL.MALE')]
  ]
  Service.relationship_options = [
    ['Spouse', t('LABEL.SPOUSE')]
    ['Registered Domestic Partner', t('LABEL.REGISTERED_DOMESTIC_PARTNER')]
    ['Parent', t('LABEL.PARENT')]
    ['Child', t('LABEL.CHILD')]
    ['Sibling', t('LABEL.SIBLING')]
    ['Cousin', t('LABEL.COUSIN')]
    ['Aunt', t('LABEL.AUNT')]
    ['Uncle', t('LABEL.UNCLE')]
    ['Nephew', t('LABEL.NEPHEW')]
    ['Niece', t('LABEL.NIECE')]
    ['Grandparent', t('LABEL.GRANDPARENT')]
    ['Great Grandparent', t('LABEL.GREAT_GRANDPARENT')]
    ['In-Law', t('LABEL.IN_LAW')]
    ['Friend', t('LABEL.FRIEND')]
    ['Other', t('LABEL.OTHER')]
  ]
  Service.ethnicity_options = [
    ['Hispanic/Latino', t('LABEL.HISPANIC_LATINO')]
    ['Not Hispanic/Latino', t('LABEL.NOT_HISPANIC_LATINO')]
  ]
  Service.race_options = [
    ['American Indian/Alaskan Native', t('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE')]
    ['Asian', t('LABEL.ASIAN')]
    ['Black/African American', t('LABEL.BLACK_AFRICAN_AMERICAN')]
    ['Native Hawaiian/Other Pacific Islander', t('LABEL.NATIVE_HAWAIIAN_OTHER_PACIFIC_ISLANDER')]
    ['White', t('LABEL.WHITE')]
    ['American Indian/Alaskan Native and Black/African American', t('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE_BLACK')]
    ['American Indian/Alaskan Native and White', t('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE_WHITE')]
    ['Asian and White', t('LABEL.ASIAN_WHITE')]
    ['Black/African American and White', t('LABEL.BLACK_AFRICAN_AMERICAN_WHITE')]
    ['Other/Multiracial', t('LABEL.OTHER_MULTIRACIAL')]
  ]
  Service.sexual_orientation_options = [
    ['Bisexual', t('LABEL.BISEXUAL')]
    ['Gay/Lesbian/Same-Gender Loving', t('LABEL.GAY_LESBIAN_SAME_GENDER_LOVING')]
    ['Questioning/Unsure', t('LABEL.QUESTIONING_UNSURE')]
    ['Straight/Heterosexual', t('LABEL.STRAIGHT_HETEROSEXUAL')]
    ['Not listed', t('LABEL.NOT_LISTED')]
  ]
  Service.preference_proof_options_default = [
    ['Telephone bill', t('LABEL.PROOF.TELEPHONE_BILL')],
    ['Cable and internet bill', t('LABEL.PROOF.CABLE_BILL')],
    ['Gas bill', t('LABEL.PROOF.GAS_BILL')],
    ['Electric bill', t('LABEL.PROOF.ELECTRIC_BILL')],
    ['Garbage bill', t('LABEL.PROOF.GARBAGE_BILL')],
    ['Water bill', t('LABEL.PROOF.WATER_BILL')],
    ['Paystub', t('LABEL.PROOF.PAYSTUB_HOME')],
    ['Public benefits record', t('LABEL.PROOF.PUBLIC_BENEFITS')],
    ['School record', t('LABEL.PROOF.SCHOOL_RECORD')],
  ]
  Service.preference_proof_options_work = [
    ['Paystub with employer address', t('LABEL.PROOF.PAYSTUB_EMPLOYER')],
    ['Letter from employer', t('LABEL.PROOF.LETTER_FROM_EMPLOYER')],
  ]
  Service.preference_proof_options_live = angular.copy(Service.preference_proof_options_default)
  Service.preference_proof_options_live.push(
    ['Letter documenting homelessness', t('LABEL.PROOF.HOMELESSNESS')],
  )

  Service.preference_proof_options_rent_burden = [
    ['Money order', t('LABEL.PROOF.MONEY_ORDER')]
    ['Cancelled check', t('LABEL.PROOF.CANCELLED_CHECK')]
    ['Debit from your bank account', t('LABEL.PROOF.DEBIT_FROM_BANK')]
    ['Screenshot of online payment', t('LABEL.PROOF.ONLINE_PAYMENT')]
  ]

  Service.preference_proof_options_alice_griffith = [
    ['Letter from SFHA verifying address ', t('LABEL.PROOF.SFHA_LETTER')]
    ['CA ID or Driver’s License', t('LABEL.PROOF.CA_LICENSE')]
    ['Telephone bill', t('LABEL.PROOF.TELEPHONE_BILL')]
    ['Cable and internet bill', t('LABEL.PROOF.CABLE_BILL')]
    ['Paystub', t('LABEL.PROOF.PAYSTUB_HOME')]
    ['Public benefits record', t('LABEL.PROOF.PUBLIC_BENEFITS')]
    ['School record', t('LABEL.PROOF.SCHOOL_RECORD')]
  ]

  Service.priority_options = [
    ['Mobility impaired', t('LABEL.MOBILITY_IMPAIRMENTS')]
    ['Vision impaired', t('LABEL.VISION_IMPAIRMENTS')]
    ['Hearing impaired', t('LABEL.HEARING_IMPAIRMENTS')]
  ]

  Service.listing_referral_options = [
    ['Newspaper', t('REFERRAL.NEWSPAPER')]
    ['MOHCD Website', t('REFERRAL.MOHCD_WEBSITE')]
    ['Developer Website', t('REFERRAL.DEVELOPER_WEBSITE')]
    ['Flyer', t('REFERRAL.FLYER')]
    ['Email Alert', t('REFERRAL.EMAIL_ALERT')]
    ['Friend', t('REFERRAL.FRIEND')]
    ['Housing Counselor', t('REFERRAL.HOUSING_COUNSELOR')]
    ['Radio Ad', t('REFERRAL.RADIO_AD')]
    ['Bus Ad', t('REFERRAL.BUS_AD')]
    ['Other', t('LABEL.OTHER')]
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
      when 'aliceGriffith'
        Service.preference_proof_options_alice_griffith
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
  Service.householdMemberForPreference = (application, pref_type) ->
    allMembers = angular.copy(application.householdMembers)
    allMembers.push(application.applicant)
    memberId = application.preferences["#{pref_type}_household_member"]
    member = _.find(allMembers, { id: memberId })
    name = if member then "#{member.firstName} #{member.lastName}" else ''
    { user: name }

  Service.fileAttachmentForPreference = (application, pref_type) ->
    proof = application.preferences.documents[pref_type]
    return '' unless proof && proof.proofOption
    interpolate = { file: proof.proofOption }
    $translate.instant('LABEL.FILE_ATTACHED', interpolate)

  Service.fileAttachmentsForRentBurden = (application) ->
    if application.status.match(/submitted/i)
      return [
        subLabel: $translate.instant('LABEL.FOR_YOUR_HOUSEHOLD')
        boldSubLabel: $translate.instant('LABEL.FILE_ATTACHED', { file: 'Lease and rent proof' })
      ]
    labels = []
    # this one is a little bit complicated because it has to sort through each set of rentBurden
    # address docs, and create an array of "For {{address}}: {{doc1}}, {{doc2}}... attached"
    _.each application.preferences.documents.rentBurden, (docs, address) ->
      proofOptions = [docs.lease.proofOption]
      rentOptions = _.compact _.map docs.rent, (file) ->
        file.proofOption if file.file
      proofOptions = $filter('listify')(_.concat(proofOptions, rentOptions))
      labels.push({
        subLabel: $translate.instant('LABEL.FOR_USER', user: address)
        boldSubLabel: $translate.instant('LABEL.FILE_ATTACHED', { file: proofOptions })
      })
    return labels

  Service.certificateNumberForPreference = (application, pref_type) ->
    certificateNumber = application.preferences["#{pref_type}_certificateNumber"]
    return '' unless certificateNumber
    $translate.instant('LABEL.CERTIFICATE_NUMBER') + ': ' + certificateNumber

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

  Service.membersTranslateVariable = (members) ->
    { user: $filter('listify')(members, "firstName")}

  return Service

ShortFormHelperService.$inject = ['$translate', '$filter', '$sce', '$state']

angular
  .module('dahlia.services')
  .service('ShortFormHelperService', ShortFormHelperService)
