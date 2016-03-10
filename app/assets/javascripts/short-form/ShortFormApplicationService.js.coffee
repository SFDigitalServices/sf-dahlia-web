ShortFormApplicationService = ($localStorage) ->
  Service = {}
  Service.applicationDefaults = {
    applicant: {
      primary_language: "English",
      phone_number: null,
      home_address: { address1: null, city: null, state: null, zip: null },
      mailing_address: { address1: null, city: null, state: null, zip: null }
    },
    alternateContact: {
      primary_language: "English"
    }
  }

  $localStorage.application ?= Service.applicationDefaults
  Service.application = $localStorage.application
  Service.applicant = Service.application.applicant
  Service.alternateContact = Service.application.alternateContact

  Service.copyHomeToMailingAddress = () ->
    angular.copy(Service.applicant.home_address, Service.applicant.mailing_address)

  Service.validMailingAddress = () ->
    Service.applicant.mailing_address.address1 &&
    Service.applicant.mailing_address.city &&
    Service.applicant.mailing_address.state &&
    Service.applicant.mailing_address.zip

  Service.missingPrimaryContactInfo = () ->
    missingInfo = []
    if !Service.applicant.phone_number
      missingInfo.push("Phone Number")
    if !Service.validMailingAddress()
      missingInfo.push("Mailing Address")
    return missingInfo

  return Service

ShortFormApplicationService.$inject = ['$localStorage']

angular
  .module('dahlia.services')
  .service('ShortFormApplicationService', ShortFormApplicationService)
