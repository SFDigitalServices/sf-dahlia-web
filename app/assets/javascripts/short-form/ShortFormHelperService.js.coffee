ShortFormHelperService = ($translate, $filter, $sce, $state, ListingPreferenceService) ->
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
          translation_key: Service.flagForI18n('demographics_accordion.options.indigenous_american_indian'),
          free_text_key: 'indigenousNativeAmericanGroup',
          free_text_placeholder: Service.flagForI18n('demographics_accordion.text_input_placeholders.indigenous_group_placeholder')
        },
        {
          key: 'Indigenous from Mexico, the Caribbean, Central America, or South America',
          translation_key: Service.flagForI18n('demographics_accordion.options.indigenous_indigenous_mexico'),
          free_text_key: 'indigenousCentralSouthAmericaGroup',
          free_text_placeholder: Service.flagForI18n('demographics_accordion.text_input_placeholders.indigenous_group_placeholder')
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
    ['SFHA Lease', Service.flagForI18n('label.proof.sfha_lease')]
    ['SF City ID', Service.flagForI18n('label.proof.sf_city_id')]
    ['Telephone bill (landline only)', Service.flagForI18n('label.proof.telephone_bill')]
    ['Cable and internet bill', Service.flagForI18n('label.proof.cable_bill')]
    ['Paystub (listing home address)', Service.flagForI18n('label.proof.paystub_home')]
    ['Public benefits record', Service.flagForI18n('label.proof.public_benefits')]
    ['School record', Service.flagForI18n('label.proof.school_record')]
  ]

  Service.preference_proof_options_right_to_return = [
    ['Letter from SFHA verifying address', Service.flagForI18n('label.proof.sfha_residency_letter')]
    ['SFHA Lease', Service.flagForI18n('label.proof.sfha_lease')]
    ['SF City ID', Service.flagForI18n('label.proof.sf_city_id')]
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
      when 'rightToReturnSunnydale'
        Service.preference_proof_options_right_to_return
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

  Service.customEducatorValidJobClassificationNumbers = [
    '0110',
    '0118',
    '0120',
    '01400',
    '0215',
    '0230',
    '0310',
    '0350',
    '0461',
    '0462',
    '0463',
    '0464',
    '0469',
    '0469C',
    '0510',
    '0561',
    '0562',
    '0563',
    '0564',
    '0570',
    '0572',
    '0700',
    '0702',
    '07114',
    '0713',
    '0715',
    '0716',
    '0719',
    '0720',
    '0729',
    '0731',
    '0732',
    '0733',
    '0734',
    '0735',
    '0736',
    '0737',
    '0737TK',
    '0738',
    '0739',
    '0740',
    '0741',
    '0743',
    '0752A',
    '0758',
    '0761',
    '0763',
    '0763C',
    '0765',
    '0768',
    '0769',
    '0770',
    '0771',
    '0771P',
    '0772',
    '0775',
    '0777',
    '0778',
    '0779',
    '0780',
    '0782',
    '0783',
    '0784',
    '0785',
    '0796',
    '0802',
    '0803',
    '0804',
    '0807',
    '0807C',
    '0808',
    '0810',
    '0811',
    '0812',
    '0813',
    '0818',
    '0823',
    '0825',
    '0827',
    '0828',
    '0831',
    '0834',
    '0920',
    '0923',
    '0925',
    '0932',
    '0934',
    '0991',
    '0992',
    '0993',
    '0994',
    '0995',
    '0996',
    '0997',
    '0998',
    '1011',
    '1032',
    '1041',
    '1042',
    '1043',
    '1052',
    '1053',
    '1054',
    '1063',
    '1070',
    '1071',
    '1073',
    '1091',
    '1092',
    '1093',
    '1094',
    '1095',
    '1202',
    '1203',
    '1204',
    '1211',
    '1212',
    '1222',
    '1224',
    '1226',
    '122U',
    '1241',
    '1244',
    '1260',
    '1310',
    '1312',
    '1372',
    '1375',
    '1378',
    '1400',
    '1400A',
    '1401',
    '1402',
    '1404',
    '1408',
    '1410',
    '1424',
    '1426',
    '1446',
    '1450',
    '1459',
    '1514',
    '1550',
    '1630',
    '1632',
    '1760',
    '1802',
    '1806',
    '1809',
    '1820',
    '1822',
    '1823',
    '1824',
    '1840',
    '1842',
    '1844',
    '1930',
    '1939',
    '1950',
    '1952',
    '1956',
    '2548',
    '2556',
    '2586',
    '2588',
    '2615',
    '2616',
    '2636',
    '2650',
    '2654',
    '2656',
    '2672',
    '2708',
    '2716',
    '2727',
    '2730',
    '2917',
    '2963',
    '2977',
    '2981',
    '3417',
    '3422',
    '3535',
    '3536',
    '355U',
    '3593N',
    '3594',
    '3594S',
    '3594V',
    '3595',
    '3598',
    '5121',
    '5241',
    '5268',
    '5295',
    '5502',
    '5504',
    '5506',
    '6331',
    '7218',
    '7219',
    '7226',
    '7233',
    '7236',
    '7238',
    '7263',
    '7268',
    '7308',
    '7318',
    '7326',
    '7334',
    '7342',
    '7344',
    '7345',
    '7346',
    '7347',
    '7355H',
    '7355M',
    '7376',
    '7381',
    '7392',
    '7395',
    '7450',
    '7514',
    '8178',
    '8201',
    '9176',
    '9343',
    '9345',
    '9772',
    '9973',
    '9977',
    '9980',
    '9987',
    '9988',
    '9993',
    'A01',
    'A01C',
    'A01M',
    'A01S',
    'A03',
    'A03C',
    'A03J',
    'A03K',
    'A03P',
    'A03S',
    'A03X',
    'A04',
    'A04C',
    'A04S',
    'A04X',
    'A09',
    'A09C',
    'A09S',
    'A11',
    'C10',
    'C10C',
    'C10M',
    'C10S',
    'C10X',
    'N10',
    'N10C',
    'N10S',
    'P80',
    'R10S',
    'R11',
    'R11C',
    'R11S',
    'R20',
    'R20A',
    'R20C',
    'R20S',
    'R30',
    'R30S',
    'R32',
    'R34',
    'R35',
    'R37',
    'R39',
    'R40',
    'R40C',
    'R40S',
    'R40X',
    'R50',
    'R50S',
    'R50X',
    'R70',
    'R70S',
    'S10',
    'S10A',
    'S10B',
    'S10C',
    'S10E',
    'S10F',
    'S10Q',
    'S10S',
    'S10VL',
    'S10W',
    'S10Z',
    'S20D',
    'S20V',
    'S22',
    'T10',
    '0701',
    'A03M',
    '0761F',
    '0826',
    '1458',
    '0832',
    '3532',
    'T10S',
    '7335',
    '0814',
    'A08'
  ]

  return Service

ShortFormHelperService.$inject = ['$translate', '$filter', '$sce', '$state']

angular
  .module('dahlia.services')
  .service('ShortFormHelperService', ShortFormHelperService)
