############################################################################################
####################################### SERVICE ############################################
############################################################################################

GISService = ($http, $q, ShortFormDataService) ->
  Service = {}

  Service.getGISData = (options) ->
    # pick out only the data we need send to the geocoder and format it
    ['member', 'applicant'].forEach (user) ->
      options[user].dob = ShortFormDataService.formatUserDOB(options[user])
      options[user] = _.pick options[user], ['firstName', 'lastName', 'dob']
    options.address = _.pick options.address, ['address1', 'city', 'state', 'zip']
    options.listing = _.pick options.listing, ['Id', 'Name']

    params = {
      address: options.address
      listing: options.listing
      project_id: options.projectId
      # member, applicant sent over for logging purposes
      member: options.member
      applicant: options.applicant
    }

    $http.post('/api/v1/addresses/gis-data.json', params).then(
      (response) -> response.data,
      (response) -> {gis_data: {boundary_match: null, foo: 'bar'}}
    )

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

GISService.$inject = ['$http', '$q', 'ShortFormDataService']

angular
  .module('dahlia.services')
  .service('GISService', GISService)
