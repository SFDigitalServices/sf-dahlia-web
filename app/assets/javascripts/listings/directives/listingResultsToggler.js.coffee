angular.module('dahlia.directives')
.directive 'listingResultsToggler', ['$translate', ($translate) ->
  restrict: 'E'
  scope: true
  templateUrl: 'listings/directives/listing-results-toggler.html'

  link: (scope, elem, attrs) ->
    scope.listings = scope[attrs.listings]
    scope.sectionName = attrs.sectionName
    scope.icon = attrs.icon || '#i-result'
    # toggler defaults to closed
    scope.displayToggledSection = false
    scope.togglerId = "#{scope.sectionName}-toggler"
    scope.text = {}

    switch scope.sectionName
      when 'lotteryResults'
        scope.text = {
          title: $translate.instant('LISTINGS.LOTTERY_RESULTS')
          subtitle: $translate.instant('LISTINGS.YOU_CAN_NOW_CHECK_LOTTERY_RESULTS')
          showResults: $translate.instant('LISTINGS.SHOW_LOTTERY_RESULTS')
          hideResults: $translate.instant('LISTINGS.HIDE_LOTTERY_RESULTS')
        }
      when 'notMatched'
        scope.text = {
          title: $translate.instant('LISTINGS.ADDITIONAL_LISTINGS')
          subtitle: $translate.instant('LISTINGS.WE_KNOW_YOU_MAY_HAVE_OPTIONS')
          showResults: $translate.instant('LISTINGS.SHOW_ADDITIONAL_LISTINGS')
          hideResults: $translate.instant('LISTINGS.HIDE_ADDITIONAL_LISTINGS')
        }
      when 'upcomingLotteries'
        scope.text = {
          title: $translate.instant('LISTINGS.UPCOMING_LOTTERIES')
          subtitle: $translate.instant('LISTINGS.APPLICATION_DEADLINE_HAS_PASSED')
          showResults: $translate.instant('LISTINGS.SHOW_UPCOMING_LOTTERIES')
          hideResults: $translate.instant('LISTINGS.HIDE_UPCOMING_LOTTERIES')
        }


    scope.toggleListings = (e) ->
      # When you use keyboard nav to click on the button inside the header
      # for some reason it triggers both a MouseEvent and KeyboardEvent.
      # So, we ignore the KeyboardEvent.
      return if e.constructor.name == 'KeyboardEvent' and angular.element(e.target).hasClass('button')
      e.currentTarget.blur() if e
      scope.displayToggledSection = !scope.displayToggledSection
]
