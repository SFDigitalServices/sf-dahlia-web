############################################################################################
####################################### SERVICE ############################################
############################################################################################

GeocodingService = ($http) ->
  Service = {}
  Service.geocoding_data = {}

  Service.geocode = (params) ->
    $http.post('/api/v1/geocode-address.json', params).success((data, status, headers, config) ->
      angular.copy(data.geocoding_data, Service.geocoding_data)
    ).error( (data, status, headers, config) ->
      # error
    )

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

GeocodingService.$inject = ['$http']

angular
  .module('dahlia.services')
  .service('GeocodingService', GeocodingService)
