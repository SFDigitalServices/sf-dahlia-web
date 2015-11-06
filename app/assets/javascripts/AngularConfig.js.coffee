@dahlia = angular.module 'dahlia', [
  # controllers
  'ListingModule',
  # services / factory
  'ListingFactoryModule',
  # filters
  'customFilters',
  # dependencies
  'ui.router',
  'templates',
  'mm.foundation',
]

# This routing directive tells Angular about the default route for our  The term "otherwise" here
# might seem somewhat awkward, but it will make more sense as we add more routes to our application
@dahlia.config ['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) ->
  $stateProvider
    .state('listings', {
      url: '/listings',
      templateUrl: 'listings/templates/listings.html'
      controller: 'ListingController',
      resolve:
        listings: ['$stateParams', 'ListingService', ($stateParams, ListingService) ->
          ListingService.getListings()
        ]
    }).state('listing', {
      url: '/listings/:id',
      templateUrl: 'listings/templates/listing.html'
      controller: 'ListingController',
      resolve:
        listing: ['$stateParams', 'ListingService', ($stateParams, ListingService) ->
          ListingService.getListing($stateParams.id)
        ]
    }).state('welcome', {
      url: '/',
      templateUrl: 'pages/templates/welcome.html'
    })
  $urlRouterProvider.otherwise('/') # default to welcome screen
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
