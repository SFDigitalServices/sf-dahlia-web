############################################################################################
####################################### SERVICE ############################################
############################################################################################

AddressValidationService = ($http) ->
  Service = {}
  Service.validated_mailing_address = {}
  Service.validated_home_address = {}

  Service.validate = (address, type = 'mailing') ->
    validated = Service["validated_#{type}_address"]
    angular.copy({}, validated)
    params =
      address: _.mapKeys(address, (v, key) ->
        # EasyPost calls it "street1" and "street2"
        key.replace('address', 'street')
      )
    $http.post('/api/v1/validate-address.json', params).success((data, status, headers, config) ->
      angular.copy((if data and data.address then data.address else {}), validated)
    ).error( (data, status, headers, config) ->
      return
    )

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AddressValidationService.$inject = ['$http']

angular
  .module('dahlia.services')
  .service('AddressValidationService', AddressValidationService)
