ShortFormHelperService = ($translate, $filter, $sce, $state) ->
  Service = {}

  # the 'flagForI18n' identity function is purely so that the Gruntfile can know where to look
  # for these translation strings (see customRegex)
  Service.flagForI18n = (str) -> str

  Service.alternate_contact_options = [
    ['Family Member', Service.flagForI18n('label.family_member')]
    ['Friend', Service.flagForI18n('label.friend')]
    ['Social Worker or Housing Counselor', Service.flagForI18n('label.social_worker_or_housing_counselor')]
    ['Other', Service.flagForI18n('label._other')]
  ]

  Service.primary_language_options = [
    ['Chinese – Cantonese', Service.flagForI18n('label.primary_language.options.chinese_cantonese')]
    ['Chinese – Mandarin', Service.flagForI18n('label.primary_language.options.chinese_mandarin')]
    ['English', Service.flagForI18n('label.primary_language.options.english')]
    ['Filipino', Service.flagForI18n('label.primary_language.options.filipino')]
    ['Russian', Service.flagForI18n('label.primary_language.options.russian')]
    ['Spanish', Service.flagForI18n('label.primary_language.options.spanish')]
    ['Vietnamese', Service.flagForI18n('label.primary_language.options.vietnamese')]
    ['Not Listed', Service.flagForI18n('label.not_listed')]
  ]

  Service.race_and_ethnicity_options = [
    {
      key: 'Asian',
      translation_key: Service.flagForI18n('demographics_accordion.options.asian'),
      suboptions: [
        {
          key: 'Chinese',
          translation_key: Service.flagForI18n('demographics_accordion.options.asian_chinese')
        },
        {
          key: 'Filipino',
          translation_key: Service.flagForI18n('demographics_accordion.options.asian_filipino')
        },
        {
          key: 'Japanese',
          translation_key: Service.flagForI18n('demographics_accordion.options.asian_japanese')
        },
        {
          key: 'Korean',
          translation_key: Service.flagForI18n('demographics_accordion.options.asian_korean')
        },
        {
          key: 'Mongolian',
          translation_key: Service.flagForI18n('demographics_accordion.options.asian_mongolian')
        },
        {
          key: 'Central Asian',
          translation_key: Service.flagForI18n('demographics_accordion.options.asian_central_asian')
        },
        {
          key: 'South Asian',
          translation_key: Service.flagForI18n('demographics_accordion.options.asian_south_asian')
        },
        {
          key: 'Southeast Asian',
          translation_key: Service.flagForI18n('demographics_accordion.options.asian_southeast_asian')
        },
        {
          key: 'Other',
          translation_key: Service.flagForI18n('demographics_accordion.options.asian_other'),
          free_text_key: 'asianOther',
          free_text_placeholder: Service.flagForI18n('demographics_accordion.text_input_placeholders.demographic_input_placeholder')
        },
      ]
    }
    {
      key: 'Black',
      translation_key: Service.flagForI18n('demographics_accordion.options.black'),
      suboptions: [
        {
          key: 'African',
          translation_key: Service.flagForI18n('demographics_accordion.options.black_african')
        },
        {
          key: 'African American',
          translation_key: Service.flagForI18n('demographics_accordion.options.black_african_american')
        },
        {
          key: 'Caribbean, Central American, South American or Mexican',
          translation_key: Service.flagForI18n('demographics_accordion.options.south_central_american')
        },
        {
          key: 'Other',
          translation_key: Service.flagForI18n('demographics_accordion.options.other')
          free_text_key: 'blackOther',
          free_text_placeholder: Service.flagForI18n('demographics_accordion.text_input_placeholders.demographic_input_placeholder')
        },
      ]
    }
    {
      key: 'Indigenous',
      translation_key: Service.flagForI18n('demographics_accordion.options.indigenous'),
      suboptions: [
        {
          key: 'American Indian/Native American',
          translation_key: Service.flagForI18n('demographics_accordion.options.indigenous_american_indian')
        },
        {
          key: 'Indigenous from Mexico, the Caribbean, Central America, or South America',
          translation_key: Service.flagForI18n('demographics_accordion.options.indigenous_indigenous_mexico')
        },
        {
          key: 'Other',
          translation_key: Service.flagForI18n('demographics_accordion.options.indigenous_other')
          free_text_key: 'indigenousOther',
          free_text_placeholder: Service.flagForI18n('demographics_accordion.text_input_placeholders.demographic_input_placeholder')
        },
      ]
    }
    {
      key: 'Latino',
      translation_key: Service.flagForI18n('demographics_accordion.options.latino'),
      suboptions: [
        {
          key: 'Caribbean',
          translation_key: Service.flagForI18n('demographics_accordion.options.latino_caribbean'),
        }
        {
          key: 'Central American',
          translation_key: Service.flagForI18n('demographics_accordion.options.latino_central_american')
        },
        {
          key: 'Mexican',
          translation_key: Service.flagForI18n('demographics_accordion.options.latino_mexican')
        },
        {
          key: 'South American',
          translation_key: Service.flagForI18n('demographics_accordion.options.latino_south_american')
        },
        {
          key: 'Other',
          translation_key: Service.flagForI18n('demographics_accordion.options.latino_other')
          free_text_key: 'latinoOther',
          free_text_placeholder: Service.flagForI18n('demographics_accordion.text_input_placeholders.demographic_input_placeholder')
        },
      ]
    }
    {
      key: 'Middle Eastern/West Asian or North African',
      translation_key: Service.flagForI18n('demographics_accordion.options.middle_eastern'),
      suboptions: [
        {
          key: 'North African',
          translation_key: Service.flagForI18n('demographics_accordion.options.middle_eastern_north_african')
        },
        {
          key: 'West Asian',
          translation_key: Service.flagForI18n('demographics_accordion.options.middle_eastern_west_asian')
        },
        {
          key: 'Other',
          translation_key: Service.flagForI18n('demographics_accordion.options.middle_eastern_other')
          free_text_key: 'menaOther',
          free_text_placeholder: Service.flagForI18n('demographics_accordion.text_input_placeholders.demographic_input_placeholder')
        },
      ]
    }
    {
      key: 'Pacific Islander',
      translation_key: Service.flagForI18n('demographics_accordion.options.pacific_islander'),
      suboptions: [
        {
          key: 'Chamorro',
          translation_key: Service.flagForI18n('demographics_accordion.options.pacific_islander_chamorro')
        },
        {
          key: 'Native Hawaiian',
          translation_key: Service.flagForI18n('demographics_accordion.options.pacific_islander_native_hawaiian')
        },
        {
          key: 'Samoan',
          translation_key: Service.flagForI18n('demographics_accordion.options.pacific_islander_samoan')
        },
        {
          key: 'Other',
          translation_key: Service.flagForI18n('demographics_accordion.options.pacific_islander_other')
          free_text_key: 'pacificIslanderOther',
          free_text_placeholder: Service.flagForI18n('demographics_accordion.text_input_placeholders.demographic_input_placeholder')
        },
      ]
    }
    {
      key: 'White',
      translation_key: Service.flagForI18n('demographics_accordion.options.white'),
      suboptions: [
        {
          key: 'European',
          translation_key: Service.flagForI18n('demographics_accordion.options.white_european')
        },
        {
          key: 'Other',
          translation_key: Service.flagForI18n('demographics_accordion.options.white_other')
          free_text_key: 'whiteOther',
          free_text_placeholder: Service.flagForI18n('demographics_accordion.text_input_placeholders.demographic_input_placeholder')
        },
      ]
    }
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
    ['Other', Service.flagForI18n('label._other')]
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
    ['Other', Service.flagForI18n('label._other')]
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
    accountSettings =  $translate.instant('account_settings.account_settings')
    link = $state.href('dahlia.account-settings')
    markup = null
    if args.page == 'b1-name' && args.infoChanged
      nameEditable = $translate.instant('b1_name.name_editable_via')
      detailsUpdated = $translate.instant('b1_name.app_details_updated')
      markup = "#{detailsUpdated} #{nameEditable} <a href='#{link}'>#{accountSettings}</a>"
    if args.page == 'b1-name' && !args.infoChanged
      nameEditable = $translate.instant('b1_name.name_editable_via')
      markup = "#{nameEditable} <a href='#{link}'>#{accountSettings}</a>"
    else if args.page == 'b2-contact'
      nameEditable = $translate.instant('b2_contact.email_editable_via')
      markup = "#{nameEditable} <a class='lined' href='#{link}'>#{accountSettings}</a>"
    return $sce.trustAsHtml(markup)

  return Service

ShortFormHelperService.$inject = ['$translate', '$filter', '$sce', '$state']

angular
  .module('dahlia.services')
  .service('ShortFormHelperService', ShortFormHelperService)
