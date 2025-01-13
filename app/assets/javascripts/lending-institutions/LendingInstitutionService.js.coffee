LendingInstitutionService = ($http) ->
  Service = {}
  Service.lendingInstitutions = {}

  Service.getLendingInstitutions = (listingIsDalp) ->
    if listingIsDalp
      $http.get("/api/v1/short-form/lending_institutions_dalp").success((data, status) ->
        angular.copy(data, Service.lendingInstitutions)
      )
    else
      $http.get("/api/v1/short-form/lending_institutions").success((data, status) ->
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

LendingInstitutionService.$inject = ['$http']

angular
  .module('dahlia.services')
  .service('LendingInstitutionService', LendingInstitutionService)
