############################################################################################
####################################### SERVICE ############################################
############################################################################################

AddressValidationService = ($http) ->
  Service = {}
  Service.validated_mailing_address = {}
  Service.validated_home_address = {}

  Service.validate = (opts) ->
    address = opts.address || {}
    type = opts.type || 'home'
    validated_address_obj = Service["validated_#{type}_address"]
    # empty out the "Validated Address" before we run validation
    angular.copy({}, validated_address_obj)
    params =
      address: _.mapKeys(address, (v, key) ->
        # EasyPost calls it "street1,2" instead of "address1,2"
        key.replace('address', 'street')
      )
    $http.post('/api/v1/addresses/validate.json', params).success((data, status, headers, config) ->
      angular.copy((if data and data.address then data.address else {}), validated_address_obj)
      # now copy the validated address data into our source address
      Service.copy(validated_address_obj, address)
    ).error( (data, status, headers, config) ->
      if status == 422
        # still grab the data for capturing the verifications/errors
        validated_with_errors = (if data and data.address then data.address else {})
        # add invalid flag to indicate validation error
        validated_with_errors.invalid = true
        angular.copy(validated_with_errors, validated_address_obj)
      else
        # even though we weren't able to clean the address, pretend we did
        angular.copy(address, validated_address_obj)
    )

  Service.copy = (validated, copyTo) ->
    copyTo.address1 = validated.street1
    copyTo.address2 = validated.street2
    copyTo.city = validated.city
    copyTo.state = validated.state
    copyTo.zip = validated.zip

  Service.isConfirmed = (address, type) ->
    validated = Service["validated_#{type}_address"]
    return false unless Service.isDeliverable(validated)
    return address.address1 == validated.street1 &&
      address.address2 == validated.street2 &&
      address.city == validated.city &&
      address.state == validated.state &&
      address.zip == validated.zip

  Service.failedValidation = (validated_address) ->
    !_.isEmpty(validated_address) && validated_address.invalid

  Service.isDeliverable = (validated_address) ->
    !_.isEmpty(validated_address) && validated_address.verifications.delivery.success


  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AddressValidationService.$inject = ['$http']

angular
  .module('dahlia.services')
  .service('AddressValidationService', AddressValidationService)
