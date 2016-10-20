############################################################################################
####################################### SERVICE ############################################
############################################################################################

AnalyticsService = ($state, $analytics) ->
  Service = {}

  Service.track = (event, properties) ->
    unless properties.label
      current_path = _.first(_.last($state.current.url.split('/')).split('?'))
      properties.label = current_path
    $analytics.eventTrack(event, properties)

  Service.trackFormSuccess = (category) ->
    Service.track('Form Message', { category: category, action: 'Form Success' })

  Service.trackFormError = (category) ->
    Service.track('Form Message', { category: category, action: 'Form Error' })

  Service.trackFormAbandon = (category) ->
    Service.track('Form Message', { category: category, action: 'Form Abandon' })

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AnalyticsService.$inject = ['$state', '$analytics']

angular
  .module('dahlia.services')
  .service('AnalyticsService', AnalyticsService)
