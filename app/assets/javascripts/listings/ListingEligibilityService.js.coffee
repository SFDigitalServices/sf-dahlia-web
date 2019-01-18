############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingEligibilityService = ($localStorage) ->
  Service = {}
  Service.eligibility_filter_defaults =
    'household_size': ''
    'income_timeframe': ''
    'income_total': ''
    'include_children_under_6': false
    'children_under_6': ''

  $localStorage.eligibility_filters ?= angular.copy(Service.eligibility_filter_defaults)
  Service.eligibility_filters = $localStorage.eligibility_filters

  Service.setEligibilityFilters = (filters) ->
    angular.copy(filters, Service.eligibility_filters)

  Service.resetEligibilityFilters = ->
    angular.copy(Service.eligibility_filter_defaults, Service.eligibility_filters)

  Service.hasEligibilityFilters = ->
    hasIncome = Service.eligibility_filters.income_total >= 0 ? true : false
    !! (hasIncome &&
        Service.eligibility_filters.income_timeframe &&
        Service.eligibility_filters.household_size)

  Service.eligibilityYearlyIncome = ->
    if Service.eligibility_filters.income_timeframe == 'per_month'
      parseFloat(Service.eligibility_filters.income_total) * 12
    else
      parseFloat(Service.eligibility_filters.income_total)

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingEligibilityService.$inject = ['$localStorage']

angular
  .module('dahlia.services')
  .service('ListingEligibilityService', ListingEligibilityService)
