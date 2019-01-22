angular.module('dahlia.components')
.component 'panelApply',
  templateUrl: 'listings/components/panel-apply.html'
  require:
    parent: '^listingContainer'
  controller: [
    'ListingService', 'ListingLotteryService', 'ShortFormApplicationService', 'AnalyticsService',
    (ListingService, ListingLotteryService, ShortFormApplicationService, AnalyticsService) ->
      ctrl = @
      @showApplicationOptions = false

      @application = ShortFormApplicationService.application

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
