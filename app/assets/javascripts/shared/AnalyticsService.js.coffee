############################################################################################
####################################### SERVICE ############################################
############################################################################################

AnalyticsService = ($state) ->
  Service = {}
  Service.timer = {}

  Service.trackEvent = (event, properties) ->
    dataLayer = window.dataLayer || []
    unless properties.label
      # by default, grab the end of the URL e.g. the "contact" from "/x/y/z/contact"
      current_path = _.first(_.last($state.current.url.split('/')).split('?'))
      if properties.label_prefix?
        properties.label = "#{properties.label_prefix} #{current_path}"
        delete properties.label_prefix
      else
        properties.label = current_path
    properties.event = event
    properties.event_timestamp = new Date().toISOString();
    dataLayer.push(properties)

  # Tracks the current page as the user navigates
  Service.trackCurrentPage = ->
    ga = window.ga || () ->
    path = Service._currentHref()
    path = '/' if path == ''
    ga('set', 'page', path)
    ga('send', 'pageview')

  Service.createApplicationTimer = (listingId) ->
    currentTimeInMs = Date.now()
    localStorage.setItem("Application_Analytics_#{listingId}", currentTimeInMs)

  Service.getApplicationDuration = (listingId) ->
    currentTimeInMs = Date.now()
    startTimeInMs = localStorage.getItem("Application_Analytics_#{listingId}")

    if startTimeInMs
      localStorage.removeItem("Application_Analytics_#{listingId}")
      return currentTimeInMs - startTimeInMs

    return null

  # Fired when the user creates an account, signs in, or requests a password change
  # Fired when a user starts an autofilled application, continues a previous draft, or resets and starts a new application
  # (This would be when the user decides not to start with an autofilled application)
  # Also fired whenever a user completes any application page (No label is attached in this instance)
  Service.trackFormSuccess = (category, label = null) ->
    params = { category: category, action: 'Form Success', label: label }
    Service.trackEvent('Form Message', params)

  Service.trackApplicationStart = (listingId, userId = null, origin = null) ->
    params = { user_id: userId, listing_id: listingId, application_started_origin: origin }
    Service.createApplicationTimer(listingId)
    Service.trackEvent('application_started', params)

  Service.trackApplicationComplete = (listingId, userId = null, reason = null) ->
    time_to_submit = Service.getApplicationDuration(listingId)
    params = { user_id: userId, listing_id: listingId, time_to_submit: time_to_submit, reason: reason }
    Service.trackEvent('application_completed', params)

  Service.trackApplicationAbandon = (listingId, userId = null, reason = null) ->
    time_to_abandon = Service.getApplicationDuration(listingId)
    params = { user_id: userId, listing_id: listingId, time_to_abandon: time_to_abandon, reason: reason }
    Service.trackEvent('application_exited', params)

  # Distinct from trackFormFieldError, this function is called when there is a validation error on the form
  # For example, if the user has an income that is out of bounds
  Service.trackFormError = (category, label = null, opts = {}) ->
    params = { category: category, action: 'Form Error', label: label }
    _.merge(params, opts)
    Service.trackEvent('Form Message', params)

  # Fired when the user triggers a form field error, fieldId attached, error handler is global
  Service.trackFormFieldError = (category, fieldId = '', opts = {}) ->
    params = { category: category, action: 'Form Field Error', fieldId: fieldId }
    _.merge(params, opts)
    Service.trackEvent('Field Message', params)

  Service._currentHref = ->
    $state.href($state.current.name, $state.params)

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

AnalyticsService.$inject = ['$state']

angular
  .module('dahlia.services')
  .service('AnalyticsService', AnalyticsService)
