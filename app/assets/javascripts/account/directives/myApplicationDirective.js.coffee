angular.module('dahlia.directives')
.directive 'myApplication', [
  '$translate', '$window', '$sce',
  'ShortFormApplicationService', 'ShortFormNavigationService', 'ListingService', 'ModalService',
  ($translate, $window, $sce,
  ShortFormApplicationService, ShortFormNavigationService, ListingService, ModalService) ->
    replace: true
    scope:
      application: '=application'
    templateUrl: 'account/directives/my-application.html'

    link: (scope, elem, attrs) ->
      scope.listing = scope.application.listing
      scope.application.deleted = false
      scope.loading = ListingService.loading
      scope.error = ListingService.error
      scope.deleteDisabled = false

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
        content =
          title: $translate.instant('T.DELETE_APPLICATION')
          cancel: $translate.instant('LABEL.CANCEL')
          continue: $translate.instant('T.DELETE')
          message: $translate.instant('MY_APPLICATIONS.ARE_YOU_SURE_YOU_WANT_TO_DELETE')
          alert: true
        ModalService.alert(content,
          onConfirm: ->
            ShortFormNavigationService.isLoading(true)
            scope.deleteDisabled = true
            ShortFormApplicationService.deleteApplication(id).success ->
              ShortFormNavigationService.isLoading(false)
              scope.application.deleted = true
            .error ->
              scope.deleteDisabled = false
        )

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
            <button class='button-link lined' ng-click='viewLotteryResults()'>
              ##{scope.application.lotteryNumber}
            </button>
          """
          $sce.trustAsHtml(html)
        else
          "##{scope.application.lotteryNumber}"

      scope.viewLotteryResults = ->
        # if the search failed, then viewLotteryResults becomes a button to open the PDF instead
        if ListingService.error.lotteryRank && scope.listing.LotteryResultsURL
          $window.open(scope.listing.LotteryResultsURL, '_blank')
          return

        ShortFormNavigationService.isLoading(true)
        # have to setup our "current" listing and application in the Services for the modal to play nicely
        ListingService.loadListing(scope.listing)
        angular.copy(scope.application, ShortFormApplicationService.application)
        # lookup individual lottery ranking and then open the modal
        ListingService.getLotteryRanking(scope.application.lotteryNumber).then(->
          ListingService.openLotteryResultsModal()
          ShortFormNavigationService.isLoading(false)
        ).catch(->
          ###
          # NOTE: Even though we have the listing already "loaded" via API AccountController `map_listings_to_applications`
          # this has one limitation which is that by using ListingService.listings() ("browse" API) we do not get LotteryResultsURL.
          # So in the event that getLotteryRanking fails and we want to fall back to LotteryResultsURL, we have to call getListing.
          ###
          ListingService.loadListing({})
          # have to restart the loader because the error would have stopped it
          ShortFormNavigationService.isLoading(true)
          ListingService.getListing(scope.listing.Id).then ->
            ShortFormNavigationService.isLoading(false)
            scope.listing = ListingService.listing
        )

      scope.getLanguageCode = (application) ->
        ShortFormApplicationService.getLanguageCode(application)

]
