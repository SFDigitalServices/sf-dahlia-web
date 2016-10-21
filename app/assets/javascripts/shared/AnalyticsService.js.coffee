############################################################################################
####################################### SERVICE ############################################
############################################################################################

AnalyticsService = ($state) ->
  Service = {}
  dataLayer = window.dataLayer || []
  ga = window.ga || {}

  Service.trackEvent = (event, properties) ->
    unless properties.label
      current_path = _.first(_.last($state.current.url.split('/')).split('?'))
      properties.label = current_path
    properties.event = event
    dataLayer.push(properties)

  Service.trackCurrentPage = ->
    path = $state.href($state.current.name, $state.params)
    ga("#{Service._namespace()}set", 'page', path)
    ga("#{Service._namespace()}send", 'pageview')

  Service.trackFormSuccess = (category) ->
    Service.trackEvent('Form Message', { category: category, action: 'Form Success' })

  Service.trackFormError = (category) ->
    Service.trackEvent('Form Message', { category: category, action: 'Form Error' })

  Service.trackFormAbandon = (category) ->
    Service.trackEvent('Form Message', { category: category, action: 'Form Abandon' })

  Service._namespace = ->
    if window.GA_NAMESPACE then "#{window.GA_NAMESPACE}." else ''

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AnalyticsService.$inject = ['$state']

angular
  .module('dahlia.services')
  .service('AnalyticsService', AnalyticsService)
