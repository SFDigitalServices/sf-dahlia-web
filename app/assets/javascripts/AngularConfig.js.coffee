@dahlia = angular.module 'dahlia', [
  'dahlia.directives',
  'dahlia.controllers',
  'dahlia.services',
  # filters
  'customFilters',
  'ng-currency',
  # dependencies
  'ui.router',
  'angular-clipboard',
  'templates',
  'mm.foundation',
  'angular.filter',
  'angulartics',
  'angulartics.google.analytics',
  'angular-carousel',
  'pascalprecht.translate',
  'ui.mask',
  'ngAria',
  'duScroll',
  'ngIdle',
  'ui.validate',
  'ng-token-auth',
  'angular-uuid',
  'ngAnimate'
]

# Custom Directives
angular.module('dahlia.directives', ['pageslide-directive', 'ngTextTruncate'])
# Service and Controller modules
angular.module('dahlia.services', ['ngStorage'])
angular.module('dahlia.controllers',['ngSanitize', 'angular-carousel', 'ngFileUpload'])

# allow trailing slashes and don't force case sensitivity on routes
@dahlia.config ['$urlMatcherFactoryProvider', ($urlMatcherFactoryProvider) ->
  $urlMatcherFactoryProvider.caseInsensitive(true)
  $urlMatcherFactoryProvider.strictMode(false)
]

# Angular UI-router setup
@dahlia.config [
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  '$translateProvider',
  ($stateProvider, $urlRouterProvider, $locationProvider, $translateProvider) ->
    $stateProvider
    .state('dahlia', {
      url: '/{lang:(?:en|es|tl|zh)}'
      abstract: true
      params:
        lang: { squash: true, value: 'en' }
        skipConfirm: { squash: true }
      views:
        'translate@':
          templateUrl: 'shared/templates/translate.html'
        'version@':
          templateUrl: 'shared/templates/version.html'
        'navigation@':
          templateUrl: 'shared/templates/nav/navigation.html'
          controller: 'NavController'
        'footer@':
          templateUrl: 'shared/templates/footer.html'
      resolve:
        translations: ['$stateParams', '$translate', ($stateParams, $translate) ->
          # this should happen after preferredLanguage is initially set
          $translate.use($stateParams.lang)
        ]
    })
    .state('dahlia.housing-counselors', {
      url: '/housing-counselors'
      views:
        'container@':
          templateUrl: 'pages/templates/housing-counselors.html',
          controller: 'HousingCounselorsController'
    })
    .state('dahlia.listings', {
      url: '/listings'
      views:
        'container@':
          templateUrl: 'listings/templates/listings.html'
          controller: 'ListingController'
      resolve:
        listings: ['$stateParams', 'ListingService', ($stateParams, ListingService) ->
          ListingService.getListings()
        ]
    })
    .state('dahlia.listing', {
      url: '/listings/:id',
      views:
        'container@':
          templateUrl: 'listings/templates/listing.html'
          controller: 'ListingController'
      resolve:
        listing: ['$stateParams', 'ListingService', ($stateParams, ListingService) ->
          ListingService.getListing($stateParams.id).then ->
            if _.isEmpty(ListingService.listing)
              # kick them out unless there's a real listing
              return $state.go('dahlia.welcome')
            # trigger this asynchronously, allowing the listing page to load first
            setTimeout(ListingService.getListingAMI)
            setTimeout(ListingService.getLotteryPreferences)
            setTimeout(ListingService.getListingUnits)
            setTimeout(ListingService.getLotteryResults)
        ]
    })
    ##########################
    # < Account/Login pages >
    ##########################
    .state('dahlia.create-account', {
      url: '/create-account'
      views:
        'container@':
          templateUrl: 'account/templates/create-account.html'
          controller: 'AccountController'
      onEnter: ['AccountService', (AccountService) ->
        AccountService.unlockFields()
      ]
    })
    .state('dahlia.short-form-application.create-account', {
      # duplicated from above but to differentiate state for "Save and finish later"
      # will be accessed at '/listings/{id}/apply/create-account'
      url: '/create-account'
      views:
        'container@':
          templateUrl: 'account/templates/create-account.html'
          controller: 'AccountController'
      onEnter: ['AccountService', (AccountService) ->
        AccountService.copyApplicantFields()
        AccountService.lockCompletedFields()
      ]

    })
    .state('dahlia.sign-in', {
      url: '/sign-in?expiredUnconfirmed&expiredConfirmed'
      params:
        newAccount: {squash: true}
        expiredUnconfirmed: null
        expiredConfirmed: null
      views:
        'container@':
          templateUrl: 'account/templates/sign-in.html'
          controller: 'AccountController'
      onEnter: ['$stateParams', 'AccountService', ($stateParams, AccountService) ->
        if $stateParams.expiredUnconfirmed
          AccountService.openConfirmationExpiredModal($stateParams.expiredUnconfirmed)
        if $stateParams.expiredConfirmed
          AccountService.openConfirmationExpiredModal($stateParams.expiredConfirmed, true)
        if $stateParams.newAccount
          AccountService.openConfirmEmailModal()
      ]
    })
    .state('dahlia.short-form-application.sign-in', {
      # duplicated from above but to differentiate state for "Save and finish later"
      # will be accessed at '/listings/{id}/apply/sign-in'
      url: '/sign-in'
      views:
        'container@':
          templateUrl: 'account/templates/sign-in.html'
          controller: 'AccountController'
    })
    ############
    # TODO: refactor "my account" pages to be under the same namespace/controller
    # once these pages become functional
    ############
    .state('dahlia.account-settings', {
      url: '/account-settings'
      views:
        'container@':
          templateUrl: 'account/templates/account-settings.html'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
    })
    .state('dahlia.eligibility-settings', {
      url: '/eligibility-settings'
      views:
        'container@':
          templateUrl: 'account/templates/eligibility-settings.html'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
    })
    .state('dahlia.my-account', {
      url: '/my-account'
      params:
        skipConfirm:
          squash: true
      views:
        'container@':
          templateUrl: 'account/templates/my-account.html'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
    })
    .state('dahlia.my-applications', {
      url: '/my-applications'
      views:
        'container@':
          controller: 'AccountController'
          templateUrl: 'account/templates/my-applications.html'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
        myApplications: ['AccountService', (AccountService) ->
          AccountService.getMyApplications()
        ]
    })
    .state('dahlia.my-favorites', {
      url: '/my-favorites'
      views:
        'container@':
          templateUrl: 'account/templates/my-favorites.html'
      resolve:
        auth: ['$auth', ($auth) ->
          $auth.validateUser()
        ]
    })
    ##########################
    # </ End Account/Login >
    ##########################
    .state('dahlia.favorites', {
      url: '/favorites'
      views:
        'container@':
          templateUrl: 'listings/templates/favorites.html'
          controller: 'ListingController'
      resolve:
        listing: ['$stateParams', 'ListingService', ($stateParams, ListingService) ->
          ListingService.getFavoriteListings()
        ]
    })
    .state('dahlia.welcome', {
      url: '/'
      views:
        'container@':
          controller: 'ListingController'
          templateUrl: 'pages/templates/welcome.html'
      resolve:
        listing: ['$stateParams', 'ListingService', ($stateParams, ListingService) ->
          ListingService.getListings()
        ]
    })
    .state('dahlia.welcome-chinese', {
      url: '/welcome-chinese'
      views:
        'container@':
          templateUrl: 'pages/templates/welcome-chinese.html'
    })
    .state('dahlia.welcome-spanish', {
      url: '/welcome-spanish'
      views:
        'container@':
          templateUrl: 'pages/templates/welcome-spanish.html'
    })
    .state('dahlia.welcome-filipino', {
      url: '/welcome-filipino'
      views:
        'container@':
          templateUrl: 'pages/templates/welcome-filipino.html'
    })
    .state('dahlia.disclaimer', {
      url: '/disclaimer'
      views:
        'container@':
          templateUrl: 'pages/templates/disclaimer.html'
    })
    .state('dahlia.privacy', {
      url: '/privacy'
      views:
        'container@':
          templateUrl: 'pages/templates/privacy.html'
    })
    .state('dahlia.share', {
      url: '/share/:id'
      views:
        'container@':
          templateUrl: 'pages/templates/share.html'
          controller: 'ShareController'
    })
    .state('dahlia.eligibility-estimator', {
      url: '/eligibility-estimator'
      views:
        'container@':
          templateUrl: 'pages/templates/eligibility-estimator.html'
          controller: 'EligibilityEstimatorController'
    })
    .state('dahlia.income-calculator', {
      url: '/income-calculator'
      abstract: true
      views:
        'container@':
          templateUrl: 'income-calculator/templates/income-calculator.html'
          controller: 'IncomeCalculatorController'
    })
    .state('dahlia.income-calculator.intro', {
      url: '/intro'
      views:
        'container':
          templateUrl: 'income-calculator/templates/pages/intro.html'
    })
    .state('dahlia.income-calculator.edit', {
      url: '/edit'
      views:
        'container':
          templateUrl: 'income-calculator/templates/pages/edit.html'
    })
    .state('dahlia.income-calculator.summary', {
      url: '/summary'
      views:
        'container':
          templateUrl: 'income-calculator/templates/pages/summary.html'
    })
    .state('dahlia.get-assistance',{
      url: '/get-assistance'
      views:
        'container@':
          templateUrl: 'pages/templates/get-assistance.html'
    })
    .state('dahlia.additional-resources',{
      url: '/additional-resources'
      views:
        'container@':
          templateUrl: 'pages/templates/additional-resources.html'
    })
    ##########################
    # Short form application #
    ##########################
    ## -- Initial Welcome Pages -- ##
    .state('dahlia.short-form-welcome', {
      url: '/listings/:id/apply-welcome'
      abstract: true
      resolve:
        listing: ['$stateParams', 'ListingService', ($stateParams, ListingService) ->
          ListingService.getListing($stateParams.id)
        ]
    })
    .state('dahlia.short-form-welcome.intro', {
      url: '/intro'
      views:
        'container@':
          templateUrl: 'short-form/templates/a1-intro.html'
          controller: 'ShortFormApplicationController'
    })
    .state('dahlia.short-form-welcome.overview', {
      url: '/overview'
      views:
        'container@':
          templateUrl: 'short-form/templates/a2-overview.html'
          controller: 'ShortFormApplicationController'
    })
    ## -- Short Form Application pages -- ##
    .state('dahlia.short-form-application', {
      url: '/listings/:id/apply'
      abstract: true
      views:
        'container@':
          templateUrl: 'short-form/templates/layout.html'
          controller: 'ShortFormApplicationController'
      resolve:
        listing: [
          '$stateParams', '$state', 'ListingService',
          ($stateParams, $state, ListingService) ->
            ListingService.getListing($stateParams.id).then ->
              if _.isEmpty(ListingService.listing)
                # kick them out unless there's a real listing
                $state.go('dahlia.welcome')
        ]
    })
    # Short form: "You" section
    .state('dahlia.short-form-application.name', {
      url: '/name'
      views:
        'container':
          templateUrl: 'short-form/templates/b1-name.html'
      onEnter: [
        'ShortFormApplicationService', 'AccountService',
        (ShortFormApplicationService, AccountService) ->
          ShortFormApplicationService.completeSection('Intro')
          if AccountService.loggedIn()
            ShortFormApplicationService.importUserData(AccountService.loggedInUser)
      ]
    })
    .state('dahlia.short-form-application.contact', {
      url: '/contact'
      params:
        error: null
      views:
        'container':
          templateUrl: 'short-form/templates/b2-contact.html'
    })
    .state('dahlia.short-form-application.verify-address', {
      url: '/verify-address'
      views:
        'container':
          templateUrl: 'short-form/templates/b2a-verify-address.html'
      resolve:
        addressValidation: [
          'AddressValidationService',
          'ShortFormApplicationService',
          'GeocodingService',
          (AddressValidationService, ShortFormApplicationService, GeocodingService) ->
            AddressValidationService.validate(
              address: ShortFormApplicationService.applicant.home_address
              type: 'home'
            ).then ->
              GeocodingService.geocode(
                address: ShortFormApplicationService.applicant.home_address
              )
        ]
    })
    .state('dahlia.short-form-application.alternate-contact-type', {
      url: '/alternate-contact-type'
      views:
        'container':
          templateUrl: 'short-form/templates/b3-alternate-contact-type.html'
    })
    .state('dahlia.short-form-application.alternate-contact-name', {
      url: '/alternate-contact-name'
      views:
        'container':
          templateUrl: 'short-form/templates/b4-alternate-contact-name.html'
    })
    .state('dahlia.short-form-application.alternate-contact-phone-address', {
      url: '/alternate-contact-phone-address'
      views:
        'container':
          templateUrl: 'short-form/templates/b4a-alternate-contact-phone-address.html'
    })
    # Short form: "Household" section
    .state('dahlia.short-form-application.household-intro', {
      url: '/household-intro'
      views:
        'container':
          templateUrl: 'short-form/templates/c1-household-intro.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('You')
        ]
    })
    .state('dahlia.short-form-application.household-overview', {
      url: '/household-overview'
      views:
        'container':
          templateUrl: 'short-form/templates/c1a-household-overview.html'
    })
    .state('dahlia.short-form-application.household-members', {
      url: '/household-members'
      views:
        'container':
          templateUrl: 'short-form/templates/c2-household-members.html'
    })
    .state('dahlia.short-form-application.household-member-form', {
      url: '/household-member-form'
      views:
        'container':
          templateUrl: 'short-form/templates/c3-household-member-form.html'
      resolve:
        householdMember: [
          'ShortFormApplicationService',
          (ShortFormApplicationService) ->
            ShortFormApplicationService.resetHouseholdmember()
        ]
    })
    .state('dahlia.short-form-application.household-member-form-edit', {
      url: '/household-member-form/:member_id'
      params:
        error: null
      views:
        'container':
          templateUrl: 'short-form/templates/c3-household-member-form.html'
      resolve:
        householdMember: [
          '$stateParams',
          'ShortFormApplicationService',
          ($stateParams, ShortFormApplicationService) ->
            ShortFormApplicationService.getHouseholdMember($stateParams.member_id)
        ]
    })
    .state('dahlia.short-form-application.household-member-verify-address', {
      url: '/household-member-verify-address/:member_id'
      views:
        'container':
          templateUrl: 'short-form/templates/c3a-household-member-verify-address.html'
      resolve:
        householdMember: [
          '$stateParams',
          'ShortFormApplicationService',
          ($stateParams, ShortFormApplicationService) ->
            ShortFormApplicationService.getHouseholdMember($stateParams.member_id)
        ]
        addressValidation: [
          'AddressValidationService',
          'ShortFormApplicationService',
          'GeocodingService',
          (AddressValidationService, ShortFormApplicationService, GeocodingService) ->
            AddressValidationService.validate(
              address: ShortFormApplicationService.householdMember.home_address
              type: 'home'
            ).then ->
              GeocodingService.geocode(
                address: ShortFormApplicationService.householdMember.home_address
              )
        ]
    })
    # Short form: "Status" section
    .state('dahlia.short-form-application.status-programs', {
      url: '/status-programs'
      views:
        'container':
          templateUrl: 'short-form/templates/d1-status-programs.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Household')
        ]
    })
    .state('dahlia.short-form-application.general-lottery-notice', {
      url: '/general-lottery-notice'
      views:
        'container':
          templateUrl: 'short-form/templates/d2f-general-lottery-notice.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Household')
        ]
    })
    .state('dahlia.short-form-application.live-work-preference', {
      url: '/live-work-preference'
      views:
        'container':
          templateUrl: 'short-form/templates/d2-live-work-preference.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Household')
        ]
    })
    .state('dahlia.short-form-application.status-vouchers', {
      url: '/status-vouchers'
      views:
        'container':
          templateUrl: 'short-form/templates/d6-status-vouchers.html'
    })
    # Short form: "Income" section
    .state('dahlia.short-form-application.income', {
      url: '/income'
      views:
        'container':
          templateUrl: 'short-form/templates/e1-income.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Status')
        ]
    })
    # Short form: "Review" section
    .state('dahlia.short-form-application.review-optional', {
      url: '/review-optional'
      views:
        'container':
          templateUrl: 'short-form/templates/f0-review-optional.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Income')
        ]
    })
    .state('dahlia.short-form-application.review-summary', {
      url: '/review-summary'
      views:
        'container':
          templateUrl: 'short-form/templates/f1-review-summary.html'
      resolve:
        completed: ['ShortFormApplicationService', (ShortFormApplicationService) ->
          ShortFormApplicationService.completeSection('Income')
        ]
    })
    .state('dahlia.short-form-application.review-terms', {
      url: '/review-terms'
      views:
        'container':
          templateUrl: 'short-form/templates/f2-review-terms.html'
    })
    .state('dahlia.short-form-application.confirmation', {
      url: '/confirmation'
      views:
        'container':
          templateUrl: 'short-form/templates/g1-confirmation.html'
    })

    $translateProvider
      .preferredLanguage('en')
      .fallbackLanguage('en')
      .useSanitizeValueStrategy('escapeParameters')
      .useStaticFilesLoader(
        prefix: '/translations/locale-'
        suffix: '.json'
      )

    $urlRouterProvider.otherwise('/') # default to welcome screen

    # have to check if browser supports html5mode (http://stackoverflow.com/a/22771095)
    if !!(window.history && history.pushState)
      $locationProvider.html5Mode({enabled: true, requireBase: false})
]

@dahlia.run [
  '$rootScope', '$state', '$window', '$translate', 'ShortFormApplicationService', 'AccountService', 'ShortFormNavigationService',
  ($rootScope, $state, $window, $translate, ShortFormApplicationService, AccountService, ShortFormNavigationService) ->
    # check if user is logged in on page load
    AccountService.validateUser()

    $rootScope.$on '$stateChangeStart', (e, toState, toParams, fromState, fromParams) ->
      if (ShortFormApplicationService.isLeavingShortForm(toState, fromState))
          # timeout from inactivity means that we don't need to ALSO ask for confirmation
          if (toParams.skipConfirm || $window.confirm($translate.instant('T.ARE_YOU_SURE_YOU_WANT_TO_LEAVE')))
            # disable the onbeforeunload so that you are no longer bothered if you
            # try to reload the listings page, for example
            $window.removeEventListener 'beforeunload', ShortFormApplicationService.onExit
            ShortFormApplicationService.resetUserData()
            AccountService.rememberShortFormState(null)
          else
            # prevent page transition if user did not confirm
            e.preventDefault()
            false
    $rootScope.$on '$stateChangeSuccess', (e, toState, toParams, fromState, fromParams) ->
      # check if we're on short form and trying to access a later section than the first section
      toSection = ShortFormNavigationService.getShortFormSectionFromState(toState)
      if toSection
        # we're in shortForm
        fromSection = ShortFormNavigationService.getShortFormSectionFromState(fromState)
        ShortFormApplicationService.checkFormState(fromState.name, fromSection) if fromSection
        if !ShortFormApplicationService.authorizedToProceed(toState, fromState, toSection)
          e.preventDefault()
          return $state.go('dahlia.short-form-application.name', toParams)
      # remember which page of short form we're on when we go to create account
      if (fromState.name.indexOf('short-form-application') >= 0 &&
        toState.name == 'dahlia.short-form-application.create-account' &&
        fromState.name != 'dahlia.short-form-application.sign-in')
          AccountService.rememberShortFormState(fromState.name)
    $rootScope.$on '$stateChangeError', (e, toState, toParams, fromState, fromParams, error) ->
      if fromState.name == ''
        return $state.go('dahlia.welcome')

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
  IdleProvider.idle(120)
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
      storage: 'sessionStorage'
      confirmationSuccessUrl: conf.confirmationSuccessUrl
      validateOnPageLoad: false
]
