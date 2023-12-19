angular.module('dahlia.components')
.component 'reviewSummarySection',
  templateUrl: 'short-form/directives/review-summary-section.html'
  transclude: true
  bindings:
    editable: '<'
    header: '@'
    sectionName: '@'
    editDescription: '@'
  controller: ['$state', ($state) ->
    ctrl = @

    ctrl.sectionHref = $state.href("dahlia.short-form-application.#{ctrl.sectionName}")

    return ctrl
  ]
