# Answer ng-token-auth's $auth from Clerk when the Clerk flag is on (CLERK_AUTH_ANGULAR,
# set by the angular layout).
# The Clerk script is loaded by the angular layout; everything here is a no-op when the flag is off.
# TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE

clerkEnabled = -> !!window.CLERK_AUTH_ANGULAR

@dahlia.factory 'ClerkShim', ['$q', ($q) ->
  loaded = null

  # the angular layout loads clerk.browser.js with defer, so window.Clerk is already set
  # (or the script failed) by the time Angular boots
  ready = ->
    return loaded if loaded
    return $q.reject('Clerk failed to load') unless window.Clerk
    # don't cache a failure, so the next call retries
    loaded = $q.when(window.Clerk.load()).then(
      -> window.Clerk
      (e) ->
        console.warn('[ClerkShim] Clerk load failed', e)
        loaded = null
        $q.reject(e)
    )

  getToken = ->
    ready().then (clerk) ->
      return null unless clerk.session
      clerk.session.getToken()

  { ready, getToken }
]

@dahlia.config ['$provide', ($provide) ->
  $provide.decorator '$auth', ['$delegate', '$q', '$injector', 'ClerkShim', ($delegate, $q, $injector, ClerkShim) ->
    originalValidateUser = $delegate.validateUser
    originalSignOut = $delegate.signOut

    $delegate.validateUser = (opts) ->
      return originalValidateUser.call($delegate, opts) unless clerkEnabled()
      ClerkShim.ready().then (clerk) ->
        return $q.reject(reason: 'unauthorized') unless clerk.session
        # the interceptor below adds the Clerk Bearer token
        $injector.get('$http').get('/api/v1/account/profile').then (resp) ->
          angular.extend($delegate.user, resp.data.data, signedIn: true)
          $delegate.user

    $delegate.signOut = ->
      return originalSignOut.apply($delegate, arguments) unless clerkEnabled()
      # clears $auth.user and any leftover Devise headers in storage
      $delegate.invalidateTokens()
      # best effort, like React's clearHousingCounselorSession
      clearHcSession = $injector.get('$http').delete('/api/v1/housing-counselor/access').catch(angular.noop)
      clearHcSession.then(ClerkShim.ready).then (clerk) ->
        clerk.signOut()

    $delegate
  ]
]

@dahlia.config ['$httpProvider', ($httpProvider) ->
  $httpProvider.interceptors.push ['$q', '$injector', ($q, $injector) ->
    request: (config) ->
      return config unless clerkEnabled() && config.url?.indexOf('/api/') == 0
      # ng-token-auth's interceptor runs first and copies stored Devise headers onto every
      # API request. Drop them so a missing Clerk token can't fall back to a stale Devise session.
      for header of $injector.get('$auth').getConfig().tokenFormat
        delete config.headers[header]
      $injector.get('ClerkShim').getToken().then(
        (token) ->
          config.headers.Authorization = "Bearer #{token}" if token
          config
        -> config
      )
  ]
]
