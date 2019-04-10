ShortFormHelperService = ($translate, $filter, $sce, $state) ->
  Service = {}

  # the 'flagForI18n' identity function is purely so that the Gruntfile can know where to look
  # for these translation strings (see customRegex)
  flagForI18n = (str) -> str

  Service.alternate_contact_options = [
    ['Family Member', flagForI18n('LABEL.FAMILY_MEMBER')]
    ['Friend', flagForI18n('LABEL.FRIEND')]
    ['Social Worker or Housing Counselor', flagForI18n('LABEL.SOCIAL_WORKER_OR_HOUSING_COUNSELOR')]
    ['Other', flagForI18n('LABEL.OTHER')]
  ]
  Service.gender_options = [
    ['Female', flagForI18n('LABEL.FEMALE')]
    ['Male', flagForI18n('LABEL.MALE')]
    ['Genderqueer/Gender Non-binary', flagForI18n('LABEL.GENDERQUEER_NON_BINARY')]
    ['Trans Female', flagForI18n('LABEL.TRANS_FEMALE')]
    ['Trans Male', flagForI18n('LABEL.TRANS_MALE')]
    ['Not Listed', flagForI18n('LABEL.NOT_LISTED')]
  ]

  Service.relationship_options = [
    ['Spouse', flagForI18n('LABEL.SPOUSE')]
    ['Registered Domestic Partner', flagForI18n('LABEL.REGISTERED_DOMESTIC_PARTNER')]
    ['Parent', flagForI18n('LABEL.PARENT')]
    ['Child', flagForI18n('LABEL.CHILD')]
    ['Sibling', flagForI18n('LABEL.SIBLING')]
    ['Cousin', flagForI18n('LABEL.COUSIN')]
    ['Aunt', flagForI18n('LABEL.AUNT')]
    ['Uncle', flagForI18n('LABEL.UNCLE')]
    ['Nephew', flagForI18n('LABEL.NEPHEW')]
    ['Niece', flagForI18n('LABEL.NIECE')]
    ['Grandparent', flagForI18n('LABEL.GRANDPARENT')]
    ['Great Grandparent', flagForI18n('LABEL.GREAT_GRANDPARENT')]
    ['In-Law', flagForI18n('LABEL.IN_LAW')]
    ['Friend', flagForI18n('LABEL.FRIEND')]
    ['Other', flagForI18n('LABEL.OTHER')]
  ]
  Service.ethnicity_options = [
    ['Hispanic/Latino', flagForI18n('LABEL.HISPANIC_LATINO')]
    ['Not Hispanic/Latino', flagForI18n('LABEL.NOT_HISPANIC_LATINO')]
  ]
  Service.race_options = [
    ['American Indian/Alaskan Native', flagForI18n('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE')]
    ['Asian', flagForI18n('LABEL.ASIAN')]
    ['Black/African American', flagForI18n('LABEL.BLACK_AFRICAN_AMERICAN')]
    ['Native Hawaiian/Other Pacific Islander', flagForI18n('LABEL.NATIVE_HAWAIIAN_OTHER_PACIFIC_ISLANDER')]
    ['White', flagForI18n('LABEL.WHITE')]
    ['American Indian/Alaskan Native and Black/African American', flagForI18n('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE_BLACK')]
    ['American Indian/Alaskan Native and White', flagForI18n('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE_WHITE')]
    ['Asian and White', flagForI18n('LABEL.ASIAN_WHITE')]
    ['Black/African American and White', flagForI18n('LABEL.BLACK_AFRICAN_AMERICAN_WHITE')]
    ['Other/Multiracial', flagForI18n('LABEL.OTHER_MULTIRACIAL')]
  ]
  Service.sexual_orientation_options = [
    ['Bisexual', flagForI18n('LABEL.BISEXUAL')]
    ['Gay/Lesbian/Same-Gender Loving', flagForI18n('LABEL.GAY_LESBIAN_SAME_GENDER_LOVING')]
    ['Questioning/Unsure', flagForI18n('LABEL.QUESTIONING_UNSURE')]
    ['Straight/Heterosexual', flagForI18n('LABEL.STRAIGHT_HETEROSEXUAL')]
    ['Not listed', flagForI18n('LABEL.NOT_LISTED')]
  ]
  Service.preference_proof_options_default = [
    ['Telephone bill', flagForI18n('LABEL.PROOF.TELEPHONE_BILL')],
    ['Cable and internet bill', flagForI18n('LABEL.PROOF.CABLE_BILL')],
    ['Gas bill', flagForI18n('LABEL.PROOF.GAS_BILL')],
    ['Electric bill', flagForI18n('LABEL.PROOF.ELECTRIC_BILL')],
    ['Garbage bill', flagForI18n('LABEL.PROOF.GARBAGE_BILL')],
    ['Water bill', flagForI18n('LABEL.PROOF.WATER_BILL')],
    ['Paystub', flagForI18n('LABEL.PROOF.PAYSTUB_HOME')],
    ['Public benefits record', flagForI18n('LABEL.PROOF.PUBLIC_BENEFITS')],
    ['School record', flagForI18n('LABEL.PROOF.SCHOOL_RECORD')],
  ]
  Service.preference_proof_options_work = [
    ['Paystub with employer address', flagForI18n('LABEL.PROOF.PAYSTUB_EMPLOYER')],
    ['Letter from employer', flagForI18n('LABEL.PROOF.LETTER_FROM_EMPLOYER')],
  ]
  Service.preference_proof_options_live = angular.copy(Service.preference_proof_options_default)
  Service.preference_proof_options_live.push(
    ['Letter documenting homelessness', flagForI18n('LABEL.PROOF.HOMELESSNESS')],
  )

  Service.preference_proof_options_rent_burden = [
    ['Money order', flagForI18n('LABEL.PROOF.MONEY_ORDER')]
    ['Cancelled check', flagForI18n('LABEL.PROOF.CANCELLED_CHECK')]
    ['Debit from your bank account', flagForI18n('LABEL.PROOF.DEBIT_FROM_BANK')]
    ['Screenshot of online payment', flagForI18n('LABEL.PROOF.ONLINE_PAYMENT')]
  ]

  Service.preference_proof_options_alice_griffith = [
    ['Letter from SFHA verifying address', flagForI18n('LABEL.PROOF.SFHA_LETTER')]
    ['CA ID or Driver\'s License', flagForI18n('LABEL.PROOF.CA_LICENSE')]
    ['Telephone bill (landline only)', flagForI18n('LABEL.PROOF.TELEPHONE_BILL')]
    ['Cable and internet bill', flagForI18n('LABEL.PROOF.CABLE_BILL')]
    ['Paystub (listing home address)', flagForI18n('LABEL.PROOF.PAYSTUB_HOME')]
    ['Public benefits record', flagForI18n('LABEL.PROOF.PUBLIC_BENEFITS')]
    ['School record', flagForI18n('LABEL.PROOF.SCHOOL_RECORD')]
  ]

  Service.priority_options = [
    ['Mobility impairments', flagForI18n('LABEL.MOBILITY_IMPAIRMENTS')]
    ['Vision impairments', flagForI18n('LABEL.VISION_IMPAIRMENTS')]
    ['Hearing impairments', flagForI18n('LABEL.HEARING_IMPAIRMENTS')]
  ]

  Service.listing_referral_options = [
    ['Newspaper', flagForI18n('REFERRAL.NEWSPAPER')]
    ['MOHCD Website', flagForI18n('REFERRAL.MOHCD_WEBSITE')]
    ['Developer Website', flagForI18n('REFERRAL.DEVELOPER_WEBSITE')]
    ['Flyer', flagForI18n('REFERRAL.FLYER')]
    ['Email Alert', flagForI18n('REFERRAL.EMAIL_ALERT')]
    ['Friend', flagForI18n('REFERRAL.FRIEND')]
    ['Housing Counselor', flagForI18n('REFERRAL.HOUSING_COUNSELOR')]
    ['Radio Ad', flagForI18n('REFERRAL.RADIO_AD')]
    ['Bus Ad', flagForI18n('REFERRAL.BUS_AD')]
    ['Other', flagForI18n('LABEL.OTHER')]
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

  Service.translateLoggedInMessage = (args) ->
    accountSettings =  $translate.instant('ACCOUNT_SETTINGS.ACCOUNT_SETTINGS')
    link = $state.href('dahlia.account-settings')
    markup = null
    if args.page == 'b1-name' && args.infoChanged
      nameEditable = $translate.instant('B1_NAME.NAME_EDITABLE_VIA')
      detailsUpdated = $translate.instant('B1_NAME.APP_DETAILS_UPDATED')
      markup = "#{detailsUpdated} #{nameEditable} <a href='#{link}'>#{accountSettings}</a>"
    if args.page == 'b1-name' && !args.infoChanged
      nameEditable = $translate.instant('B1_NAME.NAME_EDITABLE_VIA')
      markup = "#{nameEditable} <a href='#{link}'>#{accountSettings}</a>"
    else if args.page == 'b2-contact'
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
