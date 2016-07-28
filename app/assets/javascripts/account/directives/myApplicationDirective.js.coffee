angular.module('dahlia.directives')
.directive 'myApplication', [
  '$translate', 'ShortFormApplicationService', 'ListingService',
  ($translate, ShortFormApplicationService, ListingService) ->
    replace: true
    scope:
      application: '=application'
    templateUrl: 'account/directives/my-application.html'

    link: (scope, elem, attrs) ->
      # console.log(attrs)
      scope.listing = scope.application.listing
      scope.deleted = false

      scope.isDeleted = ->
        scope.deleted

      scope.unitSummary = ->
        # Studio: 22 units, 1 Bedroom: 33 units 2 Bedroom: 38 units
        summary = []
        scope.listing.unitSummary.forEach (type) ->
          str = "#{type.unitType}: #{type.totalUnits} unit"
          str += 's' if type.totalUnits > 1
          summary.push str
        summary.join(', ')

      scope.deleteApplication = (id) ->
        ShortFormApplicationService.deleteApplication(id).success ->
          scope.deleted = true

      scope.formattedAddress = ->
        ListingService.formattedAddress(scope.listing, 'Building')

      scope.applicationStyle = ->
        if scope.isSubmitted() then 'is-submitted' else 'is-editable'

      scope.isSubmitted = ->
        scope.application.status == 'Submitted'

      scope.lotteryNumber = ->
        { lotteryNumber: scope.application.lotteryNumber }

]
