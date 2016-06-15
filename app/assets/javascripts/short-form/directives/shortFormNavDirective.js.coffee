angular.module('dahlia.directives')
.directive 'shortFormNav', ['$state', ($state) ->
  restrict: 'E'
  replace: true
  scope: true
  templateUrl: 'short-form/directives/short-form-nav.html'

  link: (scope, elem, attrs) ->
    scope.sections = scope.navService.sections

    scope.isActiveSection = (section) ->
      scope.navService.isActiveSection(section)

    scope.ngHref = (section) ->
      $state.href("dahlia.short-form-application.#{scope.getLandingPage(section)}")

    # Section nav is disabled if:
    # 1. It is not the currently active section AND
    # 2. User can't access (e.g. have not made it that far)
    #  -- OR --
    # 3a. The form is invalid AND
    # 3b. It's not a previous section
    scope.sectionDisabled = (section, index) ->
      !scope.isActiveSection(section) &&
      (
        !scope.appService.userCanAccessSection(section, $state.current) ||
        (scope.form.applicationForm && scope.form.applicationForm.$invalid && !scope.navService.isPreviousSection(section))
      )
]
