# allow trailing slashes and don't force case sensitivity on routes
@dahlia.config ['$urlMatcherFactoryProvider', ($urlMatcherFactoryProvider) ->
  $urlMatcherFactoryProvider.caseInsensitive(true)
  $urlMatcherFactoryProvider.strictMode(false)
]

@dahlia.config ['$httpProvider', ($httpProvider) ->
  $httpProvider.defaults.useXDomain = true
  delete $httpProvider.defaults.headers.common["X-Requested-With"]
  $httpProvider.defaults.headers.common["Accept"] = "application/json"
  $httpProvider.defaults.headers.common["Content-Type"] = "application/json"

  $httpProvider.interceptors.push ["$location", "$rootScope", "$q", ($location, $rootScope, $q) ->
    success = (response) ->
      response
    error = (response) ->
      if response.status is 401 or 400
        $rootScope.$broadcast "event:unauthorized"
        $location.path ""
        return response
      $q.reject response
    return (promise) ->
      promise.then success, error
  ]
]

@dahlia.config ['uiMask.ConfigProvider', (uiMaskConfigProvider) ->
  uiMaskConfigProvider.clearOnBlur(false)
  uiMaskConfigProvider.clearOnBlurPlaceholder(true)
]

# ng-idle configuration
@dahlia.config ['IdleProvider', 'TitleProvider', (IdleProvider, TitleProvider) ->
  # don't override the title with timeout countdowns/warnings
  TitleProvider.enabled(false)
  IdleProvider.idle(300)
  IdleProvider.timeout(60)
]

@dahlia.config [
  '$authProvider', 'AccountConfirmationServiceProvider',
  ($authProvider, AccountConfirmationServiceProvider) ->
    # this creates a new AccountConfirmationService,
    # which can tap into AccountService to provide the appropriate confirmationSuccessUrl
    conf = AccountConfirmationServiceProvider.$get()
    $authProvider.configure
      apiUrl: '/api/v1'
      storage: getAvailableStorageType()
      confirmationSuccessUrl: conf.confirmationSuccessUrl
      validateOnPageLoad: false
]

@dahlia.config ['$translateProvider', ($translateProvider) ->
  # will generate new timestamp every hour
  timestamp = Math.floor(new Date().getTime() / (1000 * 60 * 60))
  $translateProvider
    .preferredLanguage('en')
    .fallbackLanguage('en')
    .useSanitizeValueStrategy('sceParameters')
    .useStaticFilesLoader(
      prefix: '/translations/locale-'
      suffix: ".json?t=#{timestamp}"
    )
]

@dahlia.config ['$titleProvider', ($titleProvider) ->
  $titleProvider.documentTitle ['$rootScope', ($rootScope) ->
    defaultTitle = 'DAHLIA San Francisco Housing Portal'
    if $rootScope.$title then "#{$rootScope.$title}  |  #{defaultTitle}" else defaultTitle
  ]
]


getAvailableStorageType = ->
  # When Safari (OS X or iOS) is in private browsing mode, it appears as though localStorage and sessionStorage
  # is available, but trying to call .setItem throws an exception below:
  # "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota."
  key = '__' + Math.round(Math.random() * 1e7)
  try
    sessionStorage.setItem key, key
    sessionStorage.removeItem key
    return 'sessionStorage'
  catch e
    # private window can use cookies, they will just be cleared when you close the window
    return 'cookies'
