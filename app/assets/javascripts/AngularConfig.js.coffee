@dahlia = angular.module 'dahlia', [
  # controllers
  # services / factory
  # filters
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
      # controller: 'ListingsController',
      # resolve:
      #   listings: ['$stateParams', 'ListingsService', ($stateParams, ListingsService) ->
      #     ListingsService.getListings()
      #   ]
    }).state('welcome', {
      url: '/',
      templateUrl: 'shared/templates/welcome.html'
    })
  $urlRouterProvider.otherwise('/') # default to welcome screen
]
