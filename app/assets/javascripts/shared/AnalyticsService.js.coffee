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

  Service.trackFormError = (category, label = null, opts = {}) ->
    params = { category: category, action: 'Form Error', label: label }
    _.merge(params, opts)
    Service.trackEvent('Form Message', params)

  Service.trackFormFieldError = (category, fieldId = '', opts = {}) ->
    params = { category: category, action: 'Form Field Error', fieldId: fieldId }
    _.merge(params, opts)
    Service.trackEvent('Field Message', params)

  Service.trackFormAbandon = (category) ->
    Service.trackEvent('Form Message', { category: category, action: 'Form Abandon' })

  Service.trackTimeout = (category) ->
    Service.trackEvent('Form Message', { category: category, action: 'Timeout' })

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AnalyticsService.$inject = ['$state']

angular
  .module('dahlia.services')
  .service('AnalyticsService', AnalyticsService)
