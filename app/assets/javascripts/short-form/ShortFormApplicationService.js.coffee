ShortFormApplicationService = ($localStorage) ->
  Service = {}
  Service.applicationDefaults = {
    applicant: { language: "English" }
  }

  $localStorage.application ?= Service.applicationDefaults
  Service.application = $localStorage.application

  return Service

ShortFormApplicationService.$inject = ['$localStorage']

angular
  .module('dahlia.services')
  .service('ShortFormApplicationService', ShortFormApplicationService)
