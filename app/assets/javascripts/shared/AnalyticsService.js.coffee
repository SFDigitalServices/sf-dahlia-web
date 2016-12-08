############################################################################################
####################################### SERVICE ############################################
############################################################################################

AnalyticsService = ($state) ->
  Service = {}

  Service.trackEvent = (event, properties) ->
    dataLayer = window.dataLayer || []
    unless properties.label
      current_path = _.first(_.last($state.current.url.split('/')).split('?'))
      properties.label = current_path
    properties.event = event
    dataLayer.push(properties)

  Service.trackCurrentPage = ->
    ga = window.ga || () ->
    path = $state.href($state.current.name, $state.params)
    path = '/' if path == ''
    ga('set', 'page', path)
    ga('send', 'pageview')

  Service.trackFormSuccess = (category, label = null) ->
    params = { category: category, action: 'Form Success', label: label }
    Service.trackEvent('Form Message', params)

  Service.trackFormError = (category, label = null, value = null) ->
    params = { category: category, action: 'Form Error', label: label, value: value }
    Service.trackEvent('Form Message', params)

  Service.trackFormAbandon = (category) ->
    Service.trackEvent('Form Message', { category: category, action: 'Form Abandon' })

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AnalyticsService.$inject = ['$state']

angular
  .module('dahlia.services')
  .service('AnalyticsService', AnalyticsService)
