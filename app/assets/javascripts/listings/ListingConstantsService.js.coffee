############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingConstantsService = () ->
  Service = {}

  Service._mohcdPaperAppURLBase = 'https://sfmohcd.org/sites/default/files/Documents/MOH/'
  Service._mohcdRentalPaperAppURLTemplate =
    Service._mohcdPaperAppURLBase +
    'BMR%20Rental%20Paper%20Applications/' +
    '{lang}%20BMR%20Rent%20Short%20Form%20Paper%20App.pdf'
  Service._mohcdSalePaperAppTemplate =
    Service._mohcdPaperAppURLBase +
    'BMR%20Ownership%20Paper%20Applications/' +
    '{lang}%20BMR%20Own%20Short%20Form%20Paper%20App.pdf'

  Service.paperAppLanguages = [
    { language: 'English', label: 'English' }
    { language: 'Spanish', label: 'Español' }
    { language: 'Traditional Chinese', label: '中文', slug: 'Chinese' }
    { language: 'Tagalog', label: 'Filipino' }
  ]
  Service.rentalPaperAppURLs = Service.paperAppLanguages.map((l) -> {
    language: l.language
    label: l.label
    url: Service._mohcdRentalPaperAppURLTemplate.replace('{lang}', l.slug || l.language)
  })
  Service.salePaperAppURLs = Service.paperAppLanguages.map((l) -> {
    language: l.language
    label: l.label
    url: Service._mohcdSalePaperAppTemplate.replace('{lang}', l.slug || l.language)
  })

  Service.baseUnitFieldsForGrouping = [
    'Unit_Type',
    'Reserved_Type',
    'BMR_Rental_Minimum_Monthly_Income_Needed',
    'Min_AMI_for_Qualifying_Unit',
    'Max_AMI_for_Qualifying_Unit',
    'Planning_AMI_Tier',
    'Min_Occupancy',
    'Max_Occupancy',
  ]

  Service.fieldsForRentalUnitGrouping = [
    Service.baseUnitFieldsForGrouping...,
    'BMR_Rent_Monthly',
    'Rent_percent_of_income',
    'Status',
  ]

  Service.fieldsForSaleUnitGrouping = [
    Service.baseUnitFieldsForGrouping...,
    'Price_Without_Parking',
    'Price_With_Parking',
    'HOA_Dues_Without_Parking',
    'HOA_Dues_With_Parking',
  ]

  Service.fieldsForUnitSorting = _.uniq([
    Service.fieldsForRentalUnitGrouping...,
    Service.fieldsForSaleUnitGrouping...
  ])

  Service.priorityLabelMap =
    'Vision impairments':
      name: 'Vision Impairments'
      description: 'impaired vision'
    'Hearing impairments':
      name: 'Hearing Impairments'
      description: 'impaired hearing'
    'Hearing/Vision impairments':
      name: 'Vision and/or Hearing Impairments'
      description: 'impaired vision and/or hearing'
    'Mobility/hearing/vision impairments':
      name: 'Mobility, Hearing and/or Vision Impairments'
      description: 'impaired mobility, hearing and/or vision'
    'Mobility impairments':
      name: 'Mobility Impairments'
      description: 'impaired mobility'

  Service.preferenceMap =
    certOfPreference: "Certificate of Preference (COP)"
    displaced: "Displaced Tenant Housing Preference (DTHP)"
    liveWorkInSf: "Live or Work in San Francisco Preference"
    liveInSf: "Live or Work in San Francisco Preference"
    workInSf: "Live or Work in San Francisco Preference"
    neighborhoodResidence: "Neighborhood Resident Housing Preference (NRHP)"
    assistedHousing: "Rent Burdened / Assisted Housing Preference"
    rentBurden: "Rent Burdened / Assisted Housing Preference"
    antiDisplacement: "Anti-Displacement Housing Preference (ADHP)"
    aliceGriffith: "Alice Griffith Housing Development Resident"
    rightToReturnSunnydale: "Right to Return - Sunnydale"
    veterans: "Veterans Preference"

  # List of preferences that follow the right to return pattern.
  Service.rightToReturnPreferences =
    ['aliceGriffith', 'rightToReturnSunnydale']

  # Create a mapping to Salesforce naming conventions
  Service.RESERVED_TYPES = {
    VETERAN: 'Veteran'
    DISABLED: 'Developmental disabilities'
    SENIOR: 'Senior'
    ARTIST: 'Artist Live/Work'
    ACCESSIBLE_ONLY: 'Accessible Units Only'
    HABITAT: 'Habitat for Humanity'
  }

  # TODO: -- REMOVE HARDCODED FEATURES --
  Service.LISTING_MAP = {
    'a0W0P00000F7t4uUAB': 'Merry Go Round Shared Housing'
    'a0W0P00000FIuv3UAD': '1335 Folsom Street'
    'a0W4U00000HlubxUAB': '1335 Folsom Street'
    'a0W4U00000KGFDWUA5': '1335 Folsom Street'
    'a0W4U00000KKtXyUAL': '750 Harrison'
    'a0W4U00000IXVL8UAP': '750 Harrison',
  }

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingConstantsService.$inject = []

angular
  .module('dahlia.services')
  .service('ListingConstantsService', ListingConstantsService)
