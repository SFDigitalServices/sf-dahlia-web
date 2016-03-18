angular.module('dahlia.directives')
.directive 'shortFormNav', ->
  restrict: 'E'
  replace: true
  scope:
    stateName: '='
    show: '&'
  link: (scope, elem, attrs) ->
    scope.sections = [
      { name: 'You', pages: [
          'name',
          'contact',
          'alternate-contact-required',
          'alternate-contact-type',
          'alternate-contact-name',
          'alternate-contact-phone-address',
          'optional-info'
        ]
      },
      { name: 'Household', pages: ['intro'] },
      { name: 'Status', pages: ['intro'] },
      { name: 'Income', pages: ['intro'] },
      { name: 'Review', pages: ['intro'] }
    ]

    scope.isActiveSection = (section) ->
      stateName = scope.stateName.replace('dahlia.short-form-application.', "")
      section.pages.indexOf(stateName) > -1

  templateUrl: 'short-form/directives/short-form-nav.html'
