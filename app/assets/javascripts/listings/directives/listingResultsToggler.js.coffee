angular.module('dahlia.directives')
.directive 'listingResultsToggler', ['$translate', ($translate) ->
  toggleStates = {}

  restrict: 'E'
  scope: true
  templateUrl: 'listings/directives/listing-results-toggler.html'
  link: (scope, elem, attrs) ->
    scope.listingResults = scope[attrs.listingResults]
    scope.sectionName = attrs.sectionName
    scope.icon = attrs.icon || '#i-result'
    scope.displayToggledSection = toggleStates[scope.sectionName] ? false
    scope.togglerId = "#{scope.sectionName}-toggler"
    scope.text = {}

    scope.hasListings = !!scope.listingResults.length

    switch scope.sectionName
      when 'lotteryResults'
        scope.text = {
          title: $translate.instant('LISTINGS.LOTTERY_RESULTS.TITLE')
          subtitle: $translate.instant('LISTINGS.LOTTERY_RESULTS.SUBTITLE')
          showResults: $translate.instant('LISTINGS.LOTTERY_RESULTS.SHOW')
          hideResults: $translate.instant('LISTINGS.LOTTERY_RESULTS.HIDE')
          noResults: $translate.instant('LISTINGS.LOTTERY_RESULTS.NO_RESULTS')
        }
      when 'notMatched'
        scope.text = {
          title: $translate.instant('LISTINGS.ADDITIONAL_LISTINGS.TITLE')
          subtitle: $translate.instant('LISTINGS.ADDITIONAL_LISTINGS.SUBTITLE')
          showResults: $translate.instant('LISTINGS.ADDITIONAL_LISTINGS.SHOW')
          hideResults: $translate.instant('LISTINGS.ADDITIONAL_LISTINGS.HIDE')
        }
      when 'upcomingLotteries'
        scope.text = {
          title: $translate.instant('LISTINGS.UPCOMING_LOTTERIES.TITLE')
          subtitle: $translate.instant('LISTINGS.UPCOMING_LOTTERIES.SUBTITLE')
          showResults: $translate.instant('LISTINGS.UPCOMING_LOTTERIES.SHOW')
          hideResults: $translate.instant('LISTINGS.UPCOMING_LOTTERIES.HIDE')
          noResults: $translate.instant('LISTINGS.UPCOMING_LOTTERIES.NO_RESULTS')
        }


    scope.toggleListings = (e) ->
      # When you use keyboard nav to click on the button inside the header
      # for some reason it triggers both a MouseEvent and KeyboardEvent.
      # So, we ignore the KeyboardEvent.
      return if e.constructor.name == 'KeyboardEvent' and angular.element(e.target).hasClass('button')
      e.currentTarget.blur() if e
      scope.displayToggledSection = !scope.displayToggledSection
      toggleStates[scope.sectionName] = scope.displayToggledSection
]
