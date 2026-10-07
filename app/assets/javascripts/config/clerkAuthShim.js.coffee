# Answer ng-token-auth's $auth from Clerk when the Clerk flag is on (CLERK_AUTH_ANGULAR,
# set by the angular layout).
# The Clerk script is loaded by the angular layout; everything here is a no-op when the flag is off.
# TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE

clerkEnabled = -> !!window.CLERK_AUTH_ANGULAR

@dahlia.factory 'ClerkShim', ['$q', ($q) ->
  # Clerk.load() asks Clerk's servers who's signed in. Do it once and share the result;
  # a failed load isn't kept, so the next call tries again.
  loadPromise = null

  # the angular layout loads clerk.browser.js with defer, so window.Clerk is already set
  # (or the script failed) by the time Angular boots
  ready = ->
    return $q.reject('Clerk failed to load') unless window.Clerk
    loadPromise ?= $q.when(window.Clerk.load())
      .then(-> window.Clerk)
      .catch (e) ->
        console.warn('[ClerkShim] Clerk load failed', e)
        loadPromise = null
        $q.reject(e)

  getToken = ->
    ready().then (clerk) ->
      return null unless clerk.session
      clerk.session.getToken()

  # full-page navigation out of Angular, e.g. to the React sign-in page. The promise never settles:
  # rejecting a route resolve would hit $stateChangeError, which redirects home on first load.
  leaveFor = (url) ->
    window.location.href = url
    $q.defer().promise

  # set while we sign out ourselves, so the session listener below doesn't also redirect
  { ready, getToken, leaveFor, signingOut: false }
]

# send users to sign in as soon as their Clerk session ends (expired, revoked, or signed out in
# another tab), instead of letting autosave and submit fail silently
@dahlia.run [
  '$state', '$window', 'ClerkShim', 'SharedService', 'ShortFormApplicationService',
  ($state, $window, ClerkShim, SharedService, ShortFormApplicationService) ->
    return unless clerkEnabled()
    ClerkShim.ready().then((clerk) ->
      hadSession = !!clerk.session
      clerk.addListener ({session}) ->
        # undefined means Clerk is still loading the session; only null means signed out
        return if session is undefined
        lostSession = hadSession && session is null
        hadSession = session?
        return unless lostSession && !ClerkShim.signingOut
        $window.removeEventListener('beforeunload', ShortFormApplicationService.onExit)
        ClerkShim.leaveFor(SharedService.buildUrl({name: 'dahlia.sign-in'}, $state.params))
    ).catch(angular.noop)
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
      ClerkShim.signingOut = true
      clearHcSession.then(ClerkShim.ready).then((clerk) ->
        $state = $injector.get('$state')
        ShortFormApplicationService = $injector.get('ShortFormApplicationService')
        return clerk.signOut() unless ShortFormApplicationService.isShortFormPage($state.current)
        # the legacy guest and create-account choices sign out but stay in the application, where
        # the clerkSession route guard doesn't rerun: leave for sign-in instead
        window.removeEventListener('beforeunload', ShortFormApplicationService.onExit)
        clerk.signOut(redirectUrl: $injector.get('SharedService').buildUrl({name: 'dahlia.sign-in'}, $state.params))
      ).finally ->
        ClerkShim.signingOut = false

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
