ShortFormApplicationService = () ->
  Service = {}
  Service.applicationDefaults = {
    applicant: {
      primary_language: "English",
      phone_number: null,
      home_address: { address1: null, city: null, state: null, zip: null },
      mailing_address: { address1: null, city: null, state: null, zip: null }
    }
    alternateContact: {
      primary_language: "English"
    }
    completedSections: {
      Intro: false,
      You: false,
      Household: false,
      Status: false,
      Income: false
    }
    householdMembers: []
  }
  Service.current_id = 0

  Service.application = Service.applicationDefaults
  Service.applicant = Service.application.applicant
  Service.alternateContact = Service.application.alternateContact
  Service.householdMember = {}
  Service.householdMembers = Service.application.householdMembers

  Service.completeSection = (section) ->
    Service.application.completedSections[section] = true

  Service.userCanAccessSection = (section) ->
    Service.application.completedSections ?= Service.applicationDefaults.completedSections
    completed = Service.application.completedSections
    switch section.name
      when 'You'
        completed.Intro
      when 'Household'
        completed.Intro &&
        completed.You
      when 'Status'
        completed.Intro &&
        completed.You &&
        completed.Household
      when 'Income'
        completed.Intro &&
        completed.You &&
        completed.Household &&
        completed.Status
      when 'Review'
        completed.Intro &&
        completed.You &&
        completed.Household &&
        completed.Status &&
        completed.Income
      else
        false

  Service.copyHomeToMailingAddress = () ->
    angular.copy(Service.applicant.home_address, Service.applicant.mailing_address)

  Service.validMailingAddress = () ->
    !! (Service.applicant.mailing_address.address1 &&
        Service.applicant.mailing_address.city &&
        Service.applicant.mailing_address.state &&
        Service.applicant.mailing_address.zip)

  Service.missingPrimaryContactInfo = () ->
    missingInfo = []
    if !Service.applicant.phone_number
      missingInfo.push("Phone")
    if !Service.applicant.email
      missingInfo.push("Email")
    if !Service.validMailingAddress()
      missingInfo.push("Address")
    return missingInfo

  Service._nextId = ->
    if Service.householdMembers.length > 0
      max_id = _.maxBy(Service.householdMembers, 'id').id
    else
      max_id = Service.current_id
    Service.current_id = max_id + 1

  Service.addHouseholdMember = (householdMember) ->
    if !householdMember.id
      householdMember.id = Service._nextId()
      Service.householdMembers.push(angular.copy(householdMember))
    Service.householdMember = {}

  Service.getHouseholdMember = (id) ->
    Service.householdMember = _.find(Service.householdMembers, {id: parseInt(id)})

  Service.cancelHouseholdMember = ->
    householdMembers = Service.householdMembers.filter (m) ->
      (m != Service.householdMember && m.id != Service.householdMember.id)
    # persist the changes to Service.householdMembers / $localStorage
    Service.householdMember = {}
    angular.copy(householdMembers, Service.householdMembers)

  Service.resetGenderOptions = (user, option) ->
    toggle = !user.gender[option]
    user.gender = {}
    user.gender_not_listed = null
    user.gender[option] = toggle

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ShortFormApplicationService.$inject = []

angular
  .module('dahlia.services')
  .service('ShortFormApplicationService', ShortFormApplicationService)
