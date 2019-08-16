ShortFormHelperService = ($translate, $filter, $sce, $state) ->
  Service = {}

  # the 'flagForI18n' identity function is purely so that the Gruntfile can know where to look
  # for these translation strings (see customRegex)
  Service.flagForI18n = (str) -> str

  Service.alternate_contact_options = [
    ['Family Member', Service.flagForI18n('LABEL.FAMILY_MEMBER')]
    ['Friend', Service.flagForI18n('LABEL.FRIEND')]
    ['Social Worker or Housing Counselor', Service.flagForI18n('LABEL.SOCIAL_WORKER_OR_HOUSING_COUNSELOR')]
    ['Other', Service.flagForI18n('LABEL.OTHER')]
  ]
  Service.gender_options = [
    ['Female', Service.flagForI18n('LABEL.FEMALE')]
    ['Male', Service.flagForI18n('LABEL.MALE')]
    ['Genderqueer/Gender Non-binary', Service.flagForI18n('LABEL.GENDERQUEER_NON_BINARY')]
    ['Trans Female', Service.flagForI18n('LABEL.TRANS_FEMALE')]
    ['Trans Male', Service.flagForI18n('LABEL.TRANS_MALE')]
    ['Not Listed', Service.flagForI18n('LABEL.NOT_LISTED')]
  ]

  Service.relationship_options = [
    ['Spouse', Service.flagForI18n('LABEL.SPOUSE')]
    ['Registered Domestic Partner', Service.flagForI18n('LABEL.REGISTERED_DOMESTIC_PARTNER')]
    ['Parent', Service.flagForI18n('LABEL.PARENT')]
    ['Child', Service.flagForI18n('LABEL.CHILD')]
    ['Sibling', Service.flagForI18n('LABEL.SIBLING')]
    ['Cousin', Service.flagForI18n('LABEL.COUSIN')]
    ['Aunt', Service.flagForI18n('LABEL.AUNT')]
    ['Uncle', Service.flagForI18n('LABEL.UNCLE')]
    ['Nephew', Service.flagForI18n('LABEL.NEPHEW')]
    ['Niece', Service.flagForI18n('LABEL.NIECE')]
    ['Grandparent', Service.flagForI18n('LABEL.GRANDPARENT')]
    ['Great Grandparent', Service.flagForI18n('LABEL.GREAT_GRANDPARENT')]
    ['In-Law', Service.flagForI18n('LABEL.IN_LAW')]
    ['Friend', Service.flagForI18n('LABEL.FRIEND')]
    ['Other', Service.flagForI18n('LABEL.OTHER')]
  ]
  Service.ethnicity_options = [
    ['Hispanic/Latino', Service.flagForI18n('LABEL.HISPANIC_LATINO')]
    ['Not Hispanic/Latino', Service.flagForI18n('LABEL.NOT_HISPANIC_LATINO')]
  ]
  Service.race_options = [
    ['American Indian/Alaskan Native', Service.flagForI18n('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE')]
    ['Asian', Service.flagForI18n('LABEL.ASIAN')]
    ['Black/African American', Service.flagForI18n('LABEL.BLACK_AFRICAN_AMERICAN')]
    ['Native Hawaiian/Other Pacific Islander', Service.flagForI18n('LABEL.NATIVE_HAWAIIAN_OTHER_PACIFIC_ISLANDER')]
    ['White', Service.flagForI18n('LABEL.WHITE')]
    ['American Indian/Alaskan Native and Black/African American', Service.flagForI18n('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE_BLACK')]
    ['American Indian/Alaskan Native and White', Service.flagForI18n('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE_WHITE')]
    ['Asian and White', Service.flagForI18n('LABEL.ASIAN_WHITE')]
    ['Black/African American and White', Service.flagForI18n('LABEL.BLACK_AFRICAN_AMERICAN_WHITE')]
    ['Other/Multiracial', Service.flagForI18n('LABEL.OTHER_MULTIRACIAL')]
  ]
  Service.sexual_orientation_options = [
    ['Bisexual', Service.flagForI18n('LABEL.BISEXUAL')]
    ['Gay/Lesbian/Same-Gender Loving', Service.flagForI18n('LABEL.GAY_LESBIAN_SAME_GENDER_LOVING')]
    ['Questioning/Unsure', Service.flagForI18n('LABEL.QUESTIONING_UNSURE')]
    ['Straight/Heterosexual', Service.flagForI18n('LABEL.STRAIGHT_HETEROSEXUAL')]
    ['Not listed', Service.flagForI18n('LABEL.NOT_LISTED')]
  ]
  Service.preference_proof_options_default = [
    ['Telephone bill', Service.flagForI18n('LABEL.PROOF.TELEPHONE_BILL')],
    ['Cable and internet bill', Service.flagForI18n('LABEL.PROOF.CABLE_BILL')],
    ['Gas bill', Service.flagForI18n('LABEL.PROOF.GAS_BILL')],
    ['Electric bill', Service.flagForI18n('LABEL.PROOF.ELECTRIC_BILL')],
    ['Garbage bill', Service.flagForI18n('LABEL.PROOF.GARBAGE_BILL')],
    ['Water bill', Service.flagForI18n('LABEL.PROOF.WATER_BILL')],
    ['Paystub', Service.flagForI18n('LABEL.PROOF.PAYSTUB_HOME')],
    ['Public benefits record', Service.flagForI18n('LABEL.PROOF.PUBLIC_BENEFITS')],
    ['School record', Service.flagForI18n('LABEL.PROOF.SCHOOL_RECORD')],
  ]
  Service.preference_proof_options_work = [
    ['Paystub with employer address', Service.flagForI18n('LABEL.PROOF.PAYSTUB_EMPLOYER')],
    ['Letter from employer', Service.flagForI18n('LABEL.PROOF.LETTER_FROM_EMPLOYER')],
  ]
  Service.preference_proof_options_live = angular.copy(Service.preference_proof_options_default)
  Service.preference_proof_options_live.push(
    ['Letter documenting homelessness', Service.flagForI18n('LABEL.PROOF.HOMELESSNESS')],
  )

  Service.preference_proof_options_rent_burden = [
    ['Money order', Service.flagForI18n('LABEL.PROOF.MONEY_ORDER')]
    ['Cancelled check', Service.flagForI18n('LABEL.PROOF.CANCELLED_CHECK')]
    ['Debit from your bank account', Service.flagForI18n('LABEL.PROOF.DEBIT_FROM_BANK')]
    ['Screenshot of online payment', Service.flagForI18n('LABEL.PROOF.ONLINE_PAYMENT')]
  ]

  Service.preference_proof_options_alice_griffith = [
    ['Letter from SFHA verifying address', Service.flagForI18n('LABEL.PROOF.SFHA_LETTER')]
    ['CA ID or Driver\'s License', Service.flagForI18n('LABEL.PROOF.CA_LICENSE')]
    ['Telephone bill (landline only)', Service.flagForI18n('LABEL.PROOF.TELEPHONE_BILL')]
    ['Cable and internet bill', Service.flagForI18n('LABEL.PROOF.CABLE_BILL')]
    ['Paystub (listing home address)', Service.flagForI18n('LABEL.PROOF.PAYSTUB_HOME')]
    ['Public benefits record', Service.flagForI18n('LABEL.PROOF.PUBLIC_BENEFITS')]
    ['School record', Service.flagForI18n('LABEL.PROOF.SCHOOL_RECORD')]
  ]

  Service.priority_options = [
    ['Mobility impairments', Service.flagForI18n('LABEL.MOBILITY_IMPAIRMENTS')]
    ['Vision impairments', Service.flagForI18n('LABEL.VISION_IMPAIRMENTS')]
    ['Hearing impairments', Service.flagForI18n('LABEL.HEARING_IMPAIRMENTS')]
  ]

  Service.listing_referral_options = [
    ['Newspaper', Service.flagForI18n('REFERRAL.NEWSPAPER')]
    ['MOHCD Website', Service.flagForI18n('REFERRAL.MOHCD_WEBSITE')]
    ['Developer Website', Service.flagForI18n('REFERRAL.DEVELOPER_WEBSITE')]
    ['Flyer', Service.flagForI18n('REFERRAL.FLYER')]
    ['Email Alert', Service.flagForI18n('REFERRAL.EMAIL_ALERT')]
    ['Friend', Service.flagForI18n('REFERRAL.FRIEND')]
    ['Housing Counselor', Service.flagForI18n('REFERRAL.HOUSING_COUNSELOR')]
    ['Radio Ad', Service.flagForI18n('REFERRAL.RADIO_AD')]
    ['Bus Ad', Service.flagForI18n('REFERRAL.BUS_AD')]
    ['Other', Service.flagForI18n('LABEL.OTHER')]
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

  ## Translation Helpers
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

  return Service

ShortFormHelperService.$inject = ['$translate', '$filter', '$sce', '$state']

angular
  .module('dahlia.services')
  .service('ShortFormHelperService', ShortFormHelperService)
