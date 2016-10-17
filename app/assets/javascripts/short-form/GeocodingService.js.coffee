############################################################################################
####################################### SERVICE ############################################
############################################################################################

GeocodingService = ($http, ShortFormDataService) ->
  Service = {}

  Service.geocode = (options) ->
    ['member', 'applicant'].forEach (user) ->
      options[user].dob = ShortFormDataService.formatUserDOB(options[user])
      options[user] = _.pick options[user], ['firstName', 'lastName', 'dob']
    options.address = _.pick options.address, ['address1', 'city', 'zip']
    options.listing = _.pick options.listing, ['Id', 'Name']
    params = {
      address: options.address
      listing: options.listing
      # member, applicant sent over for logging purposes
      member: options.member
      applicant: options.applicant
    }
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

GeocodingService.$inject = ['$http', 'ShortFormDataService']

angular
  .module('dahlia.services')
  .service('GeocodingService', GeocodingService)
