angular.module('dahlia.directives')
.directive 'shortFormNav', ->
  restrict: 'E'
  replace: true
  scope: true
  templateUrl: 'short-form/directives/short-form-nav.html'

  link: (scope, elem, attrs) ->
    scope.sections = scope.navService.sections

    scope.isActiveSection = (section) ->
      scope.navService.isActiveSection(section)

    scope.isPreviousSection = (section) ->
      scope.navService.isPreviousSection(section)
