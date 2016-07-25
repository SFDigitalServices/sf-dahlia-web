############################################################################################
####################################### SERVICE ############################################
############################################################################################

GeocodingService = ($http) ->
  Service = {}

  Service.geocode = (params) ->
    $http.post('/api/v1/addresses/geocode.json', params).success((data, status, headers, config) ->
      # append geocoding_data to address
      params.address.boundary_match = data.geocoding_data.boundary_match
    ).error( (data, status, headers, config) ->
      # error
      params.address.boundary_match = null
    )

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

GeocodingService.$inject = ['$http']

angular
  .module('dahlia.services')
  .service('GeocodingService', GeocodingService)
