############################################################################################
####################################### SERVICE ############################################
############################################################################################

GeocodingService = ($http) ->
  Service = {}

  Service.geocode = (options) ->
    params = { address: options.address }
    member = options.member
    $http.post('/api/v1/addresses/geocode.json', params).success((data, status, headers, config) ->
      # append neighborhoodPreferenceMatch data to member
      # 'Matched' and 'Not Matched' correspond with what gets stored in Salesforce
      match = if data.geocoding_data.boundary_match then 'Matched' else 'Not Matched'
      member.neighborhoodPreferenceMatch = match
    ).error( (data, status, headers, config) ->
      # error
      member.neighborhoodPreferenceMatch = null
    )

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

GeocodingService.$inject = ['$http']

angular
  .module('dahlia.services')
  .service('GeocodingService', GeocodingService)
