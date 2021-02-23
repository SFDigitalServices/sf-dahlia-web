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
        scope.readMore = $translate.instant('label.show_more')
        scope.readLess = $translate.instant('label.show_less')
      else
        scope.readMore = $translate.instant('label.read_more')
        scope.readLess = $translate.instant('label.read_less')

]
