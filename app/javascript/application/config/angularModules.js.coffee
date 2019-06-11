# Custom Directives
angular.module('dahlia.directives', ['pageslide-directive', 'ngTextTruncate'])
# Service and Controller modules
angular.module('dahlia.services', ['ngStorage'])
angular.module('dahlia.controllers',['ngSanitize', 'ngFileUpload'])

# angular.module('dahlia.controllers',['ngSanitize', 'angular-carousel', 'ngFileUpload'])
angular.module('dahlia.components', [])

# Raven must be configured before including `ngRaven` module below
# SENTRY_JS_URL is defined globally in application.html.slim
# if SENTRY_JS_URL?
#   Raven
#     .config(SENTRY_JS_URL)
#     .addPlugin(Raven.Plugins.Angular)
#     .install()

dahlia = angular.module 'dahlia', [
  'dahlia.directives',
  'dahlia.controllers',
  'dahlia.services',
  'dahlia.components',
  # filters
  # 'customFilters',
  'ng-currency',
  # dependencies
  'ui.router',
  'ui.router.title',
  'angular-clipboard',
  # 'templates',
  'mm.foundation',
  'angular.filter',
  # 'angular-carousel',
  'ngMessages',
  'pascalprecht.translate',
  'ui.mask',
  'ngAria',
  'duScroll',
  'ngIdle',
  'ui.validate',
  'ng-token-auth',
  'angular-uuid',
  'linkify',
  'bsLoadingOverlay',
  'http-etag',
  'ngMeta',
  # 'ngRaven'
]

export default dahlia