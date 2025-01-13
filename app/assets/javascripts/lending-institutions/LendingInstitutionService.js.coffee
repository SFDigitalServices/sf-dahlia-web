LendingInstitutionService = ($http, ShortFormApplicationService) ->
  Service = {}
  Service.lendingInstitutions = {}

  Service.getLendingInstitutions = ->
    if ShortFormApplicationService.listingIsDalp()
      $http.get("/api/v1/short-form/lending_institutions").success((data, status) ->
        angular.copy(data, Service.lendingInstitutions)
      )
    else
      $http.get("/api/v1/short-form/lending_institutions_dalp").success((data, status) ->
        angular.copy(data, Service.lendingInstitutions)
      )

  Service.getLendingAgentName = (agentId) ->
    agent = _(Service.lendingInstitutions)
              .values()
              .flatten()
              .find({'Id': agentId})

    return "#{agent['FirstName']} #{agent['LastName']}" if agent

  Service.getLendingInstitution = (agentId) ->
    _.findKey(Service.lendingInstitutions,
      (agents) -> _.find(agents, {'Id': agentId}))

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

LendingInstitutionService.$inject = ['$http', 'ShortFormApplicationService']

angular
  .module('dahlia.services')
  .service('LendingInstitutionService', LendingInstitutionService)
