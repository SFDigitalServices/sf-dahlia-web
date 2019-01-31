############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingConstantsService = () ->
  Service = {}
  Service._mohcdApplicationURLBase = 'http://sfmohcd.org/sites/default/files/Documents/MOH/BMR%20Rental%20Paper%20Applications/'
  Service._mohcdEnglishApplicationURL = Service._mohcdApplicationURLBase + 'English%20BMR%20Rent%20Short%20Form%20Paper%20App.pdf'

  Service.defaultApplicationURLs = [
    # http://sfmohcd.org/general-bmr-rental-application
    {
      'language': 'English'
      'label': 'English'
      'url': Service._mohcdEnglishApplicationURL
    }
    {
      'language': 'Spanish'
      'label': 'Español'
      'url': Service._mohcdEnglishApplicationURL.replace('English', 'Spanish')
    }
    {
      'language': 'Traditional Chinese'
      'label': '中文'
      'url': Service._mohcdEnglishApplicationURL.replace('English', 'Chinese')
    }
    {
      'language': 'Tagalog'
      'label': 'Filipino'
      'url': Service._mohcdEnglishApplicationURL.replace('English', 'Tagalog')
    }
  ]

  Service.fieldsForUnitGrouping = [
    'Unit_Type',
    'Reserved_Type',
    'BMR_Rent_Monthly',
    'BMR_Rental_Minimum_Monthly_Income_Needed',
    'Rent_percent_of_income',
    'Price_Without_Parking',
    'Price_With_Parking',
    'HOA_Dues_Without_Parking',
    'HOA_Dues_With_Parking',
    'Status',
  ]

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

  # Create a mapping to Salesforce naming conventions
  Service.RESERVED_TYPES = {
    VETERAN: 'Veteran'
    DISABLED: 'Developmental disabilities'
    SENIOR: 'Senior'
  }

  # TODO: -- REMOVE HARDCODED FEATURES --
  Service.LISTING_MAP = {
    # can also serve as slugToId map for applicable listings
    'a0WU000000DBJ9YMAX': '480 Potrero'
    'a0WU000000BdZWlMAN': 'Alchemy'
    'a0W0P00000DYQpCUAX': '21 Clarence'
    'a0W0P00000DYPP7UAP': '168 Hyde'
    'a0W0P00000DYN6BUAX': 'Olume'
    'a0WU000000BcwrAMAR': 'Rincon'
    'a0WU000000C3hBWMAZ': 'Potrero 1010'
    'a0WU000000C4FsQMAV': '529 Stevenson'
    'a0WU000000D9iF8MAJ': '888 Paris'
    'a0WU000000DB97cMAD': '77 Bluxome'
    'a0W0P00000DYbAYUA1': '3445 Geary'
    'a0W0P00000DYgtDUAT': '125 Mason'
    'a0W0P00000DYiwiUAD': 'Argenta 909'
    'a0W0P00000DYm1xUAD': 'Northpoint Vistas'
    'a0W0P00000DYlxMUAT': '280 Brighton'
    'a0W0P00000DYuFSUA1': '30 Dore'
    'a0W0P00000DYxphUAD': '168 Hyde Relisting'
    'a0W0P00000DZ4dTUAT': 'L Seven'
    'a0W6C000000DbnZUAS': 'Test Listing'
    'a0W6C000000AXCMUA4': 'AMI Chart Test 477'
    'a0W0P00000DZKPdUAP': 'Abaca'
    'a0W0P00000F6lBXUAZ': 'Transbay Block 7'
    'a0W0P00000F7t4uUAB': 'Merry Go Round Shared Housing'
    'a0W0P00000FIuv3UAD': '1335 Folsom Street'
    'a0W0P00000DhM0wUAF': '750 Harrison Street'
  }

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingConstantsService.$inject = []

angular
  .module('dahlia.services')
  .service('ListingConstantsService', ListingConstantsService)
