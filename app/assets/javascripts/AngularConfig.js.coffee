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
  'ui.mask',
]

# Custom Directives
angular.module('dahlia.directives', ['pageslide-directive', 'ngTextTruncate'])
# Service and Controller modules
angular.module('dahlia.services', ['ngStorage'])
angular.module('dahlia.controllers',['ngSanitize', 'angular-carousel'])

# allow trailing slashes and don't force case sensitivity on routes
@dahlia.config ['$urlMatcherFactoryProvider', ($urlMatcherFactoryProvider) ->
  $urlMatcherFactoryProvider.caseInsensitive(true)
  $urlMatcherFactoryProvider.strictMode(false)
]

# This routing directive tells Angular about the default route for our  The term "otherwise" here
# might seem somewhat awkward, but it will make more sense as we add more routes to our application
@dahlia.config ['$stateProvider', '$urlRouterProvider', '$locationProvider', ($stateProvider, $urlRouterProvider, $locationProvider) ->
  $stateProvider
    .state('dahlia', {
      url: ''
      abstract: true
      views:
        'translate@':
          templateUrl: 'shared/templates/translate.html'
        'version@':
          templateUrl: 'shared/templates/version.html'
        'nav@':
          templateUrl: 'shared/templates/nav/nav.html'
        'nav-mobile@':
          templateUrl: 'shared/templates/nav/nav-mobile.html'
        'footer@':
          templateUrl: 'shared/templates/footer.html'
    })
    .state('dahlia.housing-counselors',{
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
            # trigger this asynchronously, allowing the listing page to load first
            setTimeout(ListingService.getListingAMI)
            setTimeout(ListingService.getLotteryPreferences)
            setTimeout(ListingService.getListingUnits)
            setTimeout(ListingService.getLotteryResults)
        ]
    })
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
    .state('dahlia.welcome-tagalog', {
      url: '/welcome-tagalog'
      views:
        'container@':
          templateUrl: 'pages/templates/welcome-tagalog.html'
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
    .state('dahlia.short-form-application', {
      url: '/listings/:id/apply'
      abstract: true
      views:
        'container@':
          templateUrl: 'short-form/templates/layout.html'
          controller: 'ShortFormApplicationController'
      resolve:
        listing: ['$stateParams', 'ListingService', ($stateParams, ListingService) ->
          ListingService.getListing($stateParams.id)
        ]
    })
    .state('dahlia.short-form-application.intro', {
      url: '/intro'
      views:
        'container':
          templateUrl: 'short-form/templates/a1-intro.html'
    })
    .state('dahlia.short-form-application.overview', {
      url: '/overview'
      views:
        'container':
          templateUrl: 'short-form/templates/a2-overview.html'
    })
    .state('dahlia.short-form-application.name', {
      url: '/name'
      views:
        'container':
          templateUrl: 'short-form/templates/b1-name.html'
    })
    .state('dahlia.short-form-application.contact', {
      url: '/contact'
      views:
        'container':
          templateUrl: 'short-form/templates/b2-contact.html'
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
    })
    .state('dahlia.short-form-application.household-member-form-edit', {
      url: '/household-member-form/:member_id'
      views:
        'container':
          templateUrl: 'short-form/templates/c3-household-member-form.html'
      resolve:
        householdMember: ['$stateParams', 'ShortFormApplicationService', ($stateParams, ShortFormApplicationService) ->
          ShortFormApplicationService.getHouseholdMember($stateParams.member_id)
        ]
    })
    .state('dahlia.short-form-application.review', {
      url: '/review'
      views:
        'container':
          templateUrl: 'short-form/templates/f1-review.html'
    })
  $urlRouterProvider.otherwise('/') # default to welcome screen

  # have to check if browser supports html5mode (http://stackoverflow.com/a/22771095)
  if !!(window.history && history.pushState)
    $locationProvider.html5Mode({enabled: true, requireBase: false})
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
