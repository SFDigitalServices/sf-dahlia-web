ShortFormApplicationService = ($localStorage) ->
  Service = {}
  Service.applicationDefaults = {
    applicant: { language: "English" }
  }

  $localStorage.application ?= Service.applicationDefaults
  Service.application = $localStorage.application

  Service.applicant = Service.application.applicant

  Service.copyHomeToMailingAddress = () ->
    angular.copy(Service.applicant.homeAddress, Service.applicant.mailingAddress)

  Service.validMailingAddress = () ->
    Service.applicant.mailingAddress.address1 &&
    Service.applicant.mailingAddress.city &&
    Service.applicant.mailingAddress.state &&
    Service.applicant.mailingAddress.zip



  return Service

ShortFormApplicationService.$inject = ['$localStorage']

angular
  .module('dahlia.services')
  .service('ShortFormApplicationService', ShortFormApplicationService)
