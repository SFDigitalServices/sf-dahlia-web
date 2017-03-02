angular.module('dahlia.directives')
.directive 'showMoreToggler', ->
  scope:
    verb: '@'
    inline: '@'
    toggleState: '='
  replace: true
  templateUrl: 'directives/show-more-toggler.html'
