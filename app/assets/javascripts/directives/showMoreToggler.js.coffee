angular.module('dahlia.directives')
.directive 'showMoreToggler', [
  '$translate',
  ($translate) ->
    scope:
      verb: '@'
      inline: '@'
      toggleState: '='
    replace: true
    templateUrl: 'directives/show-more-toggler.html'

    link: (scope, elem, attrs) ->
      # if any other verbs to be supported other than "show" and "read", must be added here for translation purposes
      if scope.verb == 'show'
        scope.readMore = $translate.instant('LABEL.SHOW_MORE')
        scope.readLess = $translate.instant('LABEL.SHOW_LESS')
      else
        scope.readMore = $translate.instant('LABEL.READ_MORE')
        scope.readLess = $translate.instant('LABEL.READ_LESS')

]
