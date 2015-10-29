@dalia = angular.module 'dalia', [
  # controllers
  # services / factory
  # filters
  # dependencies
]

# This routing directive tells Angular about the default route for our  The term "otherwise" here
# might seem somewhat awkward, but it will make more sense as we add more routes to our application
@dalia.config ['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) ->
  $stateProvider
    .state('listings', {
      url: '/listings',
      templateUrl: 'listings.html'
      controller: 'ListingsController',
      resolve:
        listings: ['$stateParams', 'ListingsService', ($stateParams, ListingsService) ->
          ListingsService.getListings()
        ]
    }).state('welcome', {
      url: '/',
      templateUrl: 'welcome.html',
      controller: 'WelcomeController'
    })
  $urlRouterProvider.otherwise('/welcome') # default to welcome screen
]
