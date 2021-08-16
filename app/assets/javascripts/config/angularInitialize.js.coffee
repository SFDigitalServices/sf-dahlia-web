@dahlia.run [
  '$rootScope', '$state', '$window', '$translate', '$document', '$timeout',
  'Idle', 'bsLoadingOverlayService', 'ngMeta',
  'AnalyticsService', 'ShortFormApplicationService', 'AccountService', 'ShortFormNavigationService', 'AutosaveService',
  'SharedService', 'ExternalTranslateService', 'ModalService',
  ($rootScope, $state, $window, $translate, $document, $timeout, Idle, bsLoadingOverlayService, ngMeta,
  AnalyticsService, ShortFormApplicationService, AccountService, ShortFormNavigationService, AutosaveService,
  SharedService, ExternalTranslateService, ModalService) ->
    timeoutRetries = 2
    ngMeta.init()
    isFirstLoad = true

    # check if user is logged in on page load
    AccountService.validateUser()

    # start Apply Online timer
    AnalyticsService.startTimer('Apply Online Click')

    bsLoadingOverlayService.setGlobalConfig({
      delay: 0
      activeClass: 'loading'
      templateUrl: 'shared/templates/spinner.html'
    })

    $rootScope.$on 'IdleStart', ->
      content =
        title: $translate.instant('t.continue_with_your_application')
        continue: $translate.instant('t.continue')
      if AccountService.loggedIn()
        content.message = $translate.instant('t.session_inactivity_logged_in')
      else if $state.is('dahlia.short-form-application.confirmation')
        content.message = $translate.instant('t.session_inactivity_confirmation')
      else
        content.message = $translate.instant('t.session_inactivity')
      ModalService.alert(content, {nativeAlert: true})

    $rootScope.$on 'IdleTimeout', ->
      content =
        message: $translate.instant('t.session_expired')
        continue: $translate.instant('t.ok')
      ModalService.alert(content, {nativeAlert: true})
      if AccountService.loggedIn()
        AutosaveService.save() if ShortFormApplicationService.isShortFormPage($state.current)
        AccountService.signOut()
        $state.go('dahlia.sign-in', {timeout: true})
      else if ShortFormApplicationService.isShortFormPage($state.current)
        $state.go('dahlia.listing', {timeout: true, id: ShortFormApplicationService.listing.Id})

    $rootScope.$on '$stateChangeStart', (e, toState, toParams, fromState, fromParams) ->
      # always start the loading overlay
      bsLoadingOverlayService.start()

      if (SharedService.shouldRouteViaRails(toState.name, isFirstLoad))
        isFirstLoad = false

        # stop the state transition event from propagating
        if (toState.name != 'dahlia.redirect-home')
          e.preventDefault()

        $window.location.href = SharedService.buildUrl(toState, toParams)

        return

      isFirstLoad = false

      # close any open modals
      ModalService.closeModal()

      if SharedService.isWelcomePage(toState)
        # on welcome pages, the language is determined by the language of the
        # welcome page, not by toParams.lang
        welcomePageLanguage = SharedService.getWelcomePageLanguage(toState.name).code
        ExternalTranslateService.setLanguage(welcomePageLanguage)

        if toParams.lang != welcomePageLanguage
          # if toState is a language welcome page and a different lang is set in the
          # params, reload the welcome page with the matching lang param. even though
          # toParams.lang doesn't determine the language set on a welcome page, we
          # still want the URL to appear consistent, e.g. the Spanish welcome page
          # path should always be 'es/welcome-spanish'
          e.preventDefault()
          $state.go(toState.name, {lang: welcomePageLanguage})

      if (!fromState.name)
        # fromState.name being empty means the user just arrived at DAHLIA
        # start Apply Online timer, tracking if the first state that is arrived at is
        # 1) the browse listings page, 2) a single listing page, or 3) any other page
        timerVariable = switch toState.name
          when 'dahlia.listings-for-rent' then 'Browse to Application Start'
          when 'dahlia.listing' then 'Listing Page to Application Start'
          else 'Landing Page to Application Start'
        AnalyticsService.startTimer(label: 'Apply Online Click', variable: timerVariable)

      if ShortFormApplicationService.hittingBackFromConfirmation(fromState, toState)
        # the redirect will trigger $stateChangeStart again and will popup the confirmation alert
        e.preventDefault()
        $state.go('dahlia.listing', {id: ShortFormApplicationService.listing.listingID})

      else if (ShortFormApplicationService.isLeavingShortForm(toState, fromState))
        content =
          title: $translate.instant('t.leave_your_application')
          cancel: $translate.instant('t.stay')
          continue:  $translate.instant('t.leave')
          alert: true
        # Boolean for Logged in Users on the confirmation page of short form to remove the leave confirmation.
        loggedInConfirmation = (AccountService.loggedIn() && fromState.name == 'dahlia.short-form-application.confirmation')
        # Anonymous user coming from shortform and are on the confirmation page: change the leave message
        if (ShortFormApplicationService.isLeavingConfirmation(toState, fromState))
          content.message = $translate.instant('t.are_you_sure_you_want_to_leave_confirmation')
        else if (ShortFormApplicationService.isLeavingConfirmationToSignIn(toState, fromState))
          content.message = $translate.instant('t.are_you_sure_you_want_to_leave_sign_in')
        else
          content.message = $translate.instant('t.are_you_sure_you_want_to_leave')
        # timeout from inactivity means that we don't need to ALSO ask for confirmation
        skipConfirm = toParams.skipConfirm || toParams.timeout

        if (skipConfirm || loggedInConfirmation)
          # reset skipConfirm for future page actions
          toParams.skipConfirm = false
          ShortFormApplicationService.leaveAndResetShortForm(toState, toParams)
          AccountService.rememberShortFormState(null)
        else
          ModalService.alert(content,
            onConfirm: ->
              # fires only if user clicks 'ok' to leave page
              # reloads this stateChangeStart method with skipConfirm true
              toParams.skipConfirm = true
              $state.go(toState.name, toParams)
          )
          # prevent user from leaving page while viewing modal
          bsLoadingOverlayService.stop()
          e.preventDefault()
          false

      else if fromState.name.match(/create\-account/) && !toState.name.match(/sign\-in/)
        # track if they are leaving create account to go somewhere else
        AnalyticsService.trackFormAbandon('Accounts')

    $rootScope.$on '$stateChangeSuccess', (e, toState, toParams, fromState, fromParams) ->
      # always stop the loading overlay
      bsLoadingOverlayService.stop()

      SharedService.updateAlternateLanguageLinks()

      # track routes as we navigate EXCEPT for initial page load which is already tracked
      AnalyticsService.trackCurrentPage() unless fromState.name == ''

      #### Idle Trigger/Untrigger
      if ShortFormApplicationService.isShortFormPage($state.current) || AccountService.loggedIn()
        Idle.watch()
      else
        Idle.unwatch()

      unless ShortFormApplicationService.isShortFormPage($state.current) && AccountService.loggedIn()
        AutosaveService.stopTimer()

      # check if we're on short form and trying to access a later section than the first section
      toSection = ShortFormNavigationService.getShortFormSectionFromState(toState)
      if toSection
        # we're in shortForm
        fromSection = ShortFormNavigationService.getShortFormSectionFromState(fromState)
        ShortFormApplicationService.checkFormState(fromState.name, fromSection) if fromSection

        # if not authorized to proceed, take user to start of the application - prerequisites for sales, and name for rentals
        if !ShortFormApplicationService.authorizedToProceed(toState, fromState, toSection)
          e.preventDefault()
          if ShortFormApplicationService.listingIsSale()
            return $state.go('dahlia.short-form-application.prerequisites', toParams)
          return $state.go('dahlia.short-form-application.name', toParams)

      # remember which page of short form we're on when we go to create account
      # to save and finish later
      if (toState.name == 'dahlia.short-form-application.create-account' &&
        fromState.name.indexOf('short-form-application') >= 0 &&
        ! _.includes([
            'dahlia.short-form-application.confirmation',
            'dahlia.short-form-application.sign-in',
            'dahlia.short-form-application.choose-applicant-details',
          ],
          fromState.name
        ))
          AccountService.rememberShortFormState(fromState.name)

      if (fromState.name == 'dahlia.short-form-application.confirmation')
        # clear out remembered state when coming from confirmation
        AccountService.rememberShortFormState(null)

      if (toState.name == 'dahlia.short-form-application.welcome-back')
        # always remember the welcome-back page when we go to it (mainly for supporting "forgot pw")
        AccountService.rememberShortFormState(toState.name)

      if (fromState.name == 'dahlia.short-form-application.choose-applicant-details' &&
         toState.name == 'dahlia.short-form-application.create-account')
        AccountService.showChooseDiffEmailMessage = true
        # continuing with application goes to name page to show user that application name/dob/email
        # are replaced with new account settings
        AccountService.rememberShortFormState('dahlia.short-form-application.name')
      else
        AccountService.showChooseDiffEmailMessage = false

      if (fromState.name == 'dahlia.short-form-review' &&
        toState.name != 'dahlia.short-form-review')
          # Clear out application when leaving the application review page, unless going to
          # the review page (e.g. when switching languages on that page). We used to have this
          # in the dahlia.short-form-review state's onExit, but that caused a problem when going
          # from that state to itself. onExit gets called after the next state is already
          # entered and resolving, so clearing the application in onExit was wiping out the
          # application data we just loaded in the dahlia.short-form-review state's resolve.
          ShortFormApplicationService.resetApplicationData()

      ExternalTranslateService.setLanguage(toParams.lang)
      ExternalTranslateService.loadAPI().then ->
        # Wait until $digest is finished and all content on page has been updated
        # before triggering automated translation
        $timeout(ExternalTranslateService.translatePageContent, 0, false)

    $rootScope.$on '$viewContentLoaded', ->
      # Utility function to scroll to top of page when state changes
      $document.scrollTop(0) unless ShortFormApplicationService.isShortFormPage($state.current)

      # After elements are rendered, make sure to re-focus keyboard input
      # on elements either at the top or on a designated section
      $timeout ->
        if SharedService.onDocChecklistPage()
          SharedService.focusOn($state.params.section)
        else if ShortFormApplicationService.isShortFormPage($state.current)
          SharedService.focusOn('main-content')
        else
          SharedService.focusOnBody()
      , 0, false

    $rootScope.$on '$stateChangeError', (e, toState, toParams, fromState, fromParams, error) ->
      # always stop the loading overlay
      bsLoadingOverlayService.stop()

      # fromState.name is empty on initial page load
      if fromState.name == ''
        if _.isObject(error) && error.status >= 500
          timeoutRetries -= 1
          # if timing out on initial page load, retry a couple times before giving up
          $window.location.href = '/500.html' if timeoutRetries <= 0

        # redirect when there's an error
        if toState.name == 'dahlia.listing' && error.status == 404
          return $state.go('dahlia.listings-for-rent')
        else
          return $state.go('dahlia.redirect-home')
]
