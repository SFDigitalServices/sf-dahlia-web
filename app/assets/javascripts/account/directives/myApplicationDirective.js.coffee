angular.module('dahlia.directives')
.directive 'myApplication', [
  '$translate', '$window', 'ShortFormApplicationService', 'ListingService',
  ($translate, $window, ShortFormApplicationService, ListingService) ->
    replace: true
    scope:
      application: '=application'
    templateUrl: 'account/directives/my-application.html'

    link: (scope, elem, attrs) ->
      scope.listing = scope.application.listing
      scope.application.deleted = false

      scope.isDeleted = ->
        scope.application.deleted

      scope.unitSummary = ->
        return '' unless scope.listing.unitSummary
        # Studio: 22 units, 1 Bedroom: 33 units 2 Bedroom: 38 units
        summary = []
        scope.listing.unitSummary.forEach (type) ->
          str = "#{type.unitType}: #{type.totalUnits} unit"
          str += 's' if type.totalUnits > 1
          summary.push str
        summary.join(', ')

      scope.deleteApplication = (id) ->
        if $window.confirm($translate.instant('MY_APPLICATIONS.ARE_YOU_SURE_YOU_WANT_TO_DELETE'))
          ShortFormApplicationService.deleteApplication(id).success ->
            scope.application.deleted = true

      scope.formattedAddress = ->
        ListingService.formattedAddress(scope.listing, 'Building')

      scope.applicationStyle = ->
        {
          'is-submitted': scope.isSubmitted()
          'is-past-due': scope.isPastDue()
          'is-editable': !scope.isSubmitted()
        }

      scope.isSubmitted = ->
        scope.application.status == 'Submitted'

      scope.isPastDue = ->
        moment(scope.listing.Application_Due_Date) < moment()

      scope.lotteryNumber = ->
        { lotteryNumber: scope.application.lotteryNumber }

]
