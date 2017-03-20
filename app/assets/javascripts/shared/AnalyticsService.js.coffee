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
      properties.label = current_path
    properties.event = event
    dataLayer.push(properties)

  Service.trackCurrentPage = ->
    ga = window.ga || () ->
    path = Service._currentHref()
    path = '/' if path == ''
    ga('set', 'page', path)
    ga('send', 'pageview')

  Service.startTimer = (opts = {}) ->
    if opts.label
      Service.timer[opts.label] = {start: moment()}
      Service.timer[opts.label].variable = opts.variable if opts.variable

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

  Service.trackInvalidLotteryNumber = ->
    label = Service._currentHref()
    Service.trackEvent('Form Message', {
      category: 'Application',
      action: 'Invalid Lottery Number',
      label: label
    })

  Service.trackTimeout = (category) ->
    Service.trackEvent('Form Message', { category: category, action: 'Timeout' })

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
