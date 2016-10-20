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
  'angulartics.google.tagmanager',
  'angulartics.debug', # <-- turn on to debug $analytics / GTM calls
  'angular-carousel',
  'pascalprecht.translate',
  'ui.mask',
  'ngAria',
  'duScroll',
  'ngIdle',
  'ui.validate',
  'ng-token-auth',
  'angular-uuid',
  'linkify',
  'bsLoadingOverlay'
]

# Custom Directives
angular.module('dahlia.directives', ['pageslide-directive', 'ngTextTruncate'])
# Service and Controller modules
angular.module('dahlia.services', ['ngStorage'])
angular.module('dahlia.controllers',['ngSanitize', 'angular-carousel', 'ngFileUpload'])
