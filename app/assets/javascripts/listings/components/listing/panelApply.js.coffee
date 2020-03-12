angular.module('dahlia.components')
.component 'panelApply',
  templateUrl: 'listings/components/listing/panel-apply.html'
  require:
    parent: '^listingContainer'
  controller: [
    'ListingDataService', 'ListingLotteryService', 'ShortFormApplicationService', 'AnalyticsService',
    (ListingDataService, ListingLotteryService, ShortFormApplicationService, AnalyticsService) ->
      ctrl = @
      @showApplicationOptions = false
      @listingPaperAppURLs = ListingDataService.listingPaperAppURLs

      @application = ShortFormApplicationService.application
      @acceptingPaperApplications = ->
        console.log('acceptingPaperApplications', (ctrl.parent.listing.Accepting_applications_at_leasing_agent || ctrl.parent.listing.Accepting_applications_by_PO_Box))
        (ctrl.parent.listing.Accepting_applications_at_leasing_agent || ctrl.parent.listing.Accepting_applications_by_PO_Box)
      @submittedApplication = ->
        @application &&
        @application.id &&
        @application.status.toLowerCase() == 'submitted'

      @hasDraftApplication = ->
        @application &&
        @application.id &&
        @application.status.toLowerCase() == 'draft'

      @trackApplyOnlineTimer = ->
        AnalyticsService.trackTimerEvent('Application', 'Apply Online Click')

      @lotteryComplete = (listing) ->
        ListingLotteryService.lotteryComplete(listing)

      @getLanguageCode = (application) ->
        ShortFormApplicationService.getLanguageCode(application)

      @toggleApplicationOptions = () ->
        ctrl.showApplicationOptions = !ctrl.showApplicationOptions

      return ctrl
  ]
