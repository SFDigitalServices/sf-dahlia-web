############################################################################################
####################################### SERVICE ############################################
############################################################################################

AnalyticsService = ($state) ->
  Service = {}
  Service.timer = {}

  Service.resetProperties = {
    label: undefined
    event: undefined
    event_timestamp: undefined
    category: undefined
    action: undefined
    origin: undefined
    reason: undefined
    eventTimeout: undefined
    fieldId: undefined
    user_id: undefined
    time_to_abandon: undefined
    time_to_submit: undefined
    listing_id: undefined
  }

  Service.trackEvent = (event, properties) ->
    dataLayer = window.dataLayer || []
    combinedProperties = Object.assign({}, Service.resetProperties, properties)
    unless combinedProperties.label
      # by default, grab the end of the URL e.g. the "contact" from "/x/y/z/contact"
      current_path = _.first(_.last($state.current.url.split('/')).split('?'))
      combinedProperties.label = current_path
    combinedProperties.event = event
    combinedProperties.event_timestamp = Date.now()
    dataLayer.push(combinedProperties)

  # Tracks the current page as the user navigates
  Service.trackCurrentPage = ->
    ga = window.ga || () ->
    path = Service._currentHref()
    path = '/' if path == ''
    ga('set', 'page', path)
    ga('send', 'pageview')

  # Fired when the entire application is loaded. Then events are tracked as diffs from this time as the user navigates
  Service.startTimer = (opts = {}) ->
    if opts.label
      Service.timer[opts.label] = {start: moment()}
      Service.timer[opts.label].variable = opts.variable if opts.variable

  # Fired when the user clicks on the "Apply Online" button on a listing page.
  # Events are tracked as diffs from the start time with specific keys as the user navigates
  # Note that this is effectively deprecated as we no longer user the AngularJS listing page
  Service.trackTimerEvent = (category, label, variable = '') ->
    # once the timer has been cleared, we don't track it any more
    return unless Service.timer[label]

    elapsed = moment().diff(Service.timer[label].start)
    params =
      category: category
      variable: Service.timer[label].variable || variable
      label: label
      time: elapsed
    Service.timer[label] = null
    Service.trackEvent('Timer Event', params)

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
    params = { user_id: userId, listing_id: listingId, origin: origin }
    Service.createApplicationTimer(listingId)
    Service.trackEvent('Application_Start', params)

  Service.trackApplicationComplete = (listingId, userId = null, reason = null) ->
    time_to_submit = Service.getApplicationDuration(listingId)
    params = { user_id: userId, listing_id: listingId, time_to_submit: time_to_submit, reason: reason }
    Service.trackEvent('Application_Complete', params)

  Service.trackApplicationAbandon = (listingId, userId = null, reason = null) ->
    time_to_abandon = Service.getApplicationDuration(listingId)
    params = { user_id: userId, listing_id: listingId, time_to_abandon: time_to_abandon, reason: reason }
    Service.trackEvent('Application_Abandon', params)

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

  # Fired when the user leaves the create account page without creating an account
  # Fired when the user exits the application process
  Service.trackFormAbandon = (category) ->
    Service.trackEvent('Form Message', { category: category, action: 'Form Abandon' })

  # Fired when the user inputs a lotter number that is invalid
  Service.trackInvalidLotteryNumber = ->
    label = Service._currentHref()
    Service.trackEvent('Form Message', {
      category: 'Application',
      action: 'Invalid Lottery Number',
      label: label
    })

  # Fired when the user leaves an application as a result of a timeout
  Service.trackTimeout = (category) ->
    Service.trackEvent('Form Message', { category: category, action: 'Timeout' })

  # Fired when the user reached the my account page with a confirmed account
  Service.trackAccountCreation =  ->
    Service.trackEvent('Form Message', { category: 'Accounts', action: 'Account Creation', label: 'Account Confirmation Success' })

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
