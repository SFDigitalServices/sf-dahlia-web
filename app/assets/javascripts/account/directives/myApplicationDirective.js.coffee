angular.module('dahlia.directives')
.directive 'myApplication', [
  '$translate', '$window', '$sce', '$compile',
  'ShortFormApplicationService', 'ShortFormNavigationService', 'ListingService',
  ($translate, $window, $sce, $compile,
  ShortFormApplicationService, ShortFormNavigationService, ListingService) ->
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
          ShortFormNavigationService.isLoading(true)
          ShortFormApplicationService.deleteApplication(id).success ->
            ShortFormNavigationService.isLoading(false)
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
        ShortFormApplicationService.applicationWasSubmitted(scope.application)

      scope.submittedWithLotteryResults = ->
        scope.isSubmitted() && scope.listing.Lottery_Results

      scope.isPastDue = ->
        moment(scope.listing.Application_Due_Date) < moment()

      scope.lotteryNumber = ->
        if scope.listing.Lottery_Results
          html = """
            <button class='button-link lined' ng-click='getLotteryRanking()'>
              ##{scope.application.lotteryNumber}
            </button>
          """
          $sce.trustAsHtml(html)
        else
          "##{scope.application.lotteryNumber}"

      scope.getLotteryRanking = ->
        ShortFormNavigationService.isLoading(true)
        # set the "current listing" and "current application" so that everything in ListingController (used by the modal) plays nicely
        ListingService.loadListing(scope.listing)
        angular.copy(scope.application, ShortFormApplicationService.application)
        # lookup individual lottery ranking and then open the modal
        ListingService.getLotteryRanking(scope.application.lotteryNumber).then ->
          ListingService.openLotteryResultsModal()
          ShortFormNavigationService.isLoading(false)

]
