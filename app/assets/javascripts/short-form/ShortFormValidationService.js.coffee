ShortFormValidationService = () ->
  Service = {}

  Service.userCanAccessSection = (application, section) ->
    Service["userCanAccess_#{section}"](application)

  Service.userCanAccess_You = (application) ->
    # you can always get to this section
    true

  Service.userCanAccess_Household = (application) ->
    a = application.applicant
    vals = [
      a.first_name,
      a.last_name,
      a.dob_month,
      a.dob_day,
      a.dob_year,
    ]
    _.every vals, (val) -> val && !_.isEmpty(val.toString())


  Service.userCanAccess_Status = (application) ->
    false

  Service.userCanAccess_Income = (application) ->
    false

  Service.userCanAccess_Review = (application) ->
    false

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

angular
  .module('dahlia.services')
  .service('ShortFormValidationService', ShortFormValidationService)
