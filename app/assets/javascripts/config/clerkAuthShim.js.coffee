# POC: answer ng-token-auth's $auth from Clerk when CLERK_AUTH_ANGULAR is on.
# See docs/clerk-devise-bridge.md ("Shim over $auth").
# The Clerk script is loaded by the angular layout; everything here is a no-op when the flag is off.

clerkEnabled = -> !!window.CLERK_AUTH_ANGULAR

@dahlia.factory 'ClerkShim', ['$q', '$timeout', ($q, $timeout) ->
  loaded = null

  # clerk.browser.js is loaded async, so wait for window.Clerk before calling load()
  ready = ->
    return loaded if loaded
    deferred = $q.defer()
    attempts = 0
    poll = ->
      if window.Clerk
        $q.when(window.Clerk.load()).then(
          -> deferred.resolve(window.Clerk)
          (e) -> deferred.reject(e)
        )
      else if attempts++ < 200
        $timeout(poll, 50, false)
      else
        deferred.reject('Clerk failed to load')
    poll()
    # don't cache a failure, so the next call retries
    loaded = deferred.promise.catch (e) ->
      console.warn('[ClerkShim] Clerk load failed', e)
      loaded = null
      $q.reject(e)

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
      ClerkShim.ready().then (clerk) ->
        clerk.signOut().then ->
          angular.copy({}, $delegate.user)

    $delegate
  ]
]

@dahlia.config ['$httpProvider', ($httpProvider) ->
  $httpProvider.interceptors.push ['$q', '$injector', ($q, $injector) ->
    request: (config) ->
      return config unless clerkEnabled() && config.url?.indexOf('/api/') == 0
      $injector.get('ClerkShim').getToken().then(
        (token) ->
          config.headers.Authorization = "Bearer #{token}" if token
          config
        -> config
      )
  ]
]
