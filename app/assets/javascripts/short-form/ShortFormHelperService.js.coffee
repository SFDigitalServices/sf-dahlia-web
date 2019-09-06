ShortFormHelperService = ($translate, $filter, $sce, $state) ->
  Service = {}

  # the 'flagForI18n' identity function is purely so that the Gruntfile can know where to look
  # for these translation strings (see customRegex)
  Service.flagForI18n = (str) -> str

  Service.alternate_contact_options = [
    ['Family Member', Service.flagForI18n('label.family_member')]
    ['Friend', Service.flagForI18n('label.friend')]
    ['Social Worker or Housing Counselor', Service.flagForI18n('label.social_worker_or_housing_counselor')]
    ['Other', Service.flagForI18n('label.other')]
  ]
  Service.gender_options = [
    ['Female', Service.flagForI18n('label.female')]
    ['Male', Service.flagForI18n('label.male')]
    ['Genderqueer/Gender Non-binary', Service.flagForI18n('label.genderqueer_non_binary')]
    ['Trans Female', Service.flagForI18n('label.trans_female')]
    ['Trans Male', Service.flagForI18n('label.trans_male')]
    ['Not Listed', Service.flagForI18n('label.not_listed')]
  ]

  Service.relationship_options = [
    ['Spouse', Service.flagForI18n('label.spouse')]
    ['Registered Domestic Partner', Service.flagForI18n('label.registered_domestic_partner')]
    ['Parent', Service.flagForI18n('label.parent')]
    ['Child', Service.flagForI18n('label.child')]
    ['Sibling', Service.flagForI18n('label.sibling')]
    ['Cousin', Service.flagForI18n('label.cousin')]
    ['Aunt', Service.flagForI18n('label.aunt')]
    ['Uncle', Service.flagForI18n('label.uncle')]
    ['Nephew', Service.flagForI18n('label.nephew')]
    ['Niece', Service.flagForI18n('label.niece')]
    ['Grandparent', Service.flagForI18n('label.grandparent')]
    ['Great Grandparent', Service.flagForI18n('label.great_grandparent')]
    ['In-Law', Service.flagForI18n('label.in_law')]
    ['Friend', Service.flagForI18n('label.friend')]
    ['Other', Service.flagForI18n('label.other')]
  ]
  Service.ethnicity_options = [
    ['Hispanic/Latino', Service.flagForI18n('label.hispanic_latino')]
    ['Not Hispanic/Latino', Service.flagForI18n('label.not_hispanic_latino')]
  ]
  Service.race_options = [
    ['American Indian/Alaskan Native', Service.flagForI18n('label.american_indian_alaskan_native')]
    ['Asian', Service.flagForI18n('label.asian')]
    ['Black/African American', Service.flagForI18n('label.black_african_american')]
    ['Native Hawaiian/Other Pacific Islander', Service.flagForI18n('label.native_hawaiian_other_pacific_islander')]
    ['White', Service.flagForI18n('label.white')]
    ['American Indian/Alaskan Native and Black/African American', Service.flagForI18n('label.american_indian_alaskan_native_black')]
    ['American Indian/Alaskan Native and White', Service.flagForI18n('label.american_indian_alaskan_native_white')]
    ['Asian and White', Service.flagForI18n('label.asian_white')]
    ['Black/African American and White', Service.flagForI18n('label.black_african_american_white')]
    ['Other/Multiracial', Service.flagForI18n('label.other_multiracial')]
  ]
  Service.sexual_orientation_options = [
    ['Bisexual', Service.flagForI18n('label.bisexual')]
    ['Gay/Lesbian/Same-Gender Loving', Service.flagForI18n('label.gay_lesbian_same_gender_loving')]
    ['Questioning/Unsure', Service.flagForI18n('label.questioning_unsure')]
    ['Straight/Heterosexual', Service.flagForI18n('label.straight_heterosexual')]
    ['Not listed', Service.flagForI18n('label.not_listed')]
  ]
  Service.preference_proof_options_default = [
    ['Telephone bill', Service.flagForI18n('label.proof.telephone_bill')],
    ['Cable and internet bill', Service.flagForI18n('label.proof.cable_bill')],
    ['Gas bill', Service.flagForI18n('label.proof.gas_bill')],
    ['Electric bill', Service.flagForI18n('label.proof.electric_bill')],
    ['Garbage bill', Service.flagForI18n('label.proof.garbage_bill')],
    ['Water bill', Service.flagForI18n('label.proof.water_bill')],
    ['Paystub', Service.flagForI18n('label.proof.paystub_home')],
    ['Public benefits record', Service.flagForI18n('label.proof.public_benefits')],
    ['School record', Service.flagForI18n('label.proof.school_record')],
  ]
  Service.preference_proof_options_work = [
    ['Paystub with employer address', Service.flagForI18n('label.proof.paystub_employer')],
    ['Letter from employer', Service.flagForI18n('label.proof.letter_from_employer')],
  ]
  Service.preference_proof_options_live = angular.copy(Service.preference_proof_options_default)
  Service.preference_proof_options_live.push(
    ['Letter documenting homelessness', Service.flagForI18n('label.proof.homelessness')],
  )

  Service.preference_proof_options_rent_burden = [
    ['Money order', Service.flagForI18n('label.proof.money_order')]
    ['Cancelled check', Service.flagForI18n('label.proof.cancelled_check')]
    ['Debit from your bank account', Service.flagForI18n('label.proof.debit_from_bank')]
    ['Screenshot of online payment', Service.flagForI18n('label.proof.online_payment')]
  ]

  Service.preference_proof_options_alice_griffith = [
    ['Letter from SFHA verifying address', Service.flagForI18n('label.proof.sfha_letter')]
    ['CA ID or Driver\'s License', Service.flagForI18n('label.proof.ca_license')]
    ['Telephone bill (landline only)', Service.flagForI18n('label.proof.telephone_bill')]
    ['Cable and internet bill', Service.flagForI18n('label.proof.cable_bill')]
    ['Paystub (listing home address)', Service.flagForI18n('label.proof.paystub_home')]
    ['Public benefits record', Service.flagForI18n('label.proof.public_benefits')]
    ['School record', Service.flagForI18n('label.proof.school_record')]
  ]

  Service.priority_options = [
    ['Mobility impairments', Service.flagForI18n('label.mobility_impairments')]
    ['Vision impairments', Service.flagForI18n('label.vision_impairments')]
    ['Hearing impairments', Service.flagForI18n('label.hearing_impairments')]
  ]

  Service.listing_referral_options = [
    ['Newspaper', Service.flagForI18n('referral.newspaper')]
    ['MOHCD Website', Service.flagForI18n('referral.mohcd_website')]
    ['Developer Website', Service.flagForI18n('referral.developer_website')]
    ['Flyer', Service.flagForI18n('referral.flyer')]
    ['Email Alert', Service.flagForI18n('referral.email_alert')]
    ['Friend', Service.flagForI18n('referral.friend')]
    ['Housing Counselor', Service.flagForI18n('referral.housing_counselor')]
    ['Radio Ad', Service.flagForI18n('referral.radio_ad')]
    ['Bus Ad', Service.flagForI18n('referral.bus_ad')]
    ['Other', Service.flagForI18n('label.other')]
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
