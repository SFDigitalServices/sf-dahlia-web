############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingHelperService = (ListingService) ->
  Service = {}

  Service.priorityLabel = (priority, modifier) ->
    labelMap =
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

    return priority unless labelMap[priority]
    return labelMap[priority][modifier]


  Service.reservedLabel = (listing, type,  modifier) ->
    labelMap =
      "#{ListingService.RESERVED_TYPES.SENIOR}":
        building: 'Senior'
        eligibility: 'Seniors'
        reservedFor: "seniors #{Service.seniorMinimumAge(listing)}"
        reservedForWhoAre: "seniors #{Service.seniorMinimumAge(listing)}"
        unitDescription: "seniors #{Service.seniorMinimumAge(listing)}"
      "#{ListingService.RESERVED_TYPES.VETERAN}":
        building: 'Veterans'
        eligibility: 'Veterans'
        reservedFor: 'veterans'
        reservedForWhoAre: 'veterans'
        unitDescription: 'veterans of the U.S. Armed Forces'
      "#{ListingService.RESERVED_TYPES.DISABLED}":
        building: 'Developmental Disability'
        eligibility: 'People with developmental disabilities'
        reservedFor: 'people with developmental disabilities'
        reservedForWhoAre: 'developmentally disabled'
        unitDescription: 'people with developmental disabilities'

    return type unless labelMap[type]
    return labelMap[type][modifier]

  Service.seniorMinimumAge = (listing) ->
    if listing.Reserved_community_minimum_age
      "#{listing.Reserved_community_minimum_age}+"
    else
      ''


  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingHelperService.$inject = ['ListingService']

angular
  .module('dahlia.services')
  .service('ListingHelperService', ListingHelperService)
