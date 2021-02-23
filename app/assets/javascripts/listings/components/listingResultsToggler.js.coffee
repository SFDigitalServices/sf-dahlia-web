angular.module('dahlia.components')
.component 'listingResultsToggler',
  templateUrl: 'listings/components/listing-results-toggler.html'
  bindings:
    listingResults: '<'
    sectionName: '@'
    icon: '@'
  controller: ['$translate', ($translate) ->
    ctrl = @

    this.$onInit = ->
      @setupText()

    @toggleStates = {}
    @displayToggledSection = @toggleStates[@sectionName] ? false
    @togglerId = "#{@sectionName}-toggler"
    @text = {}

    @hasListings = !!@listingResults.length

    @setupText = ->
      switch @sectionName
        when 'lotteryResults'
          @text = {
            title: $translate.instant('listings.lottery_results.title')
            subtitle: $translate.instant('listings.lottery_results.subtitle')
            showResults: $translate.instant('listings.lottery_results.show')
            hideResults: $translate.instant('listings.lottery_results.hide')
            noResults: $translate.instant('listings.lottery_results.no_results')
          }
        when 'notMatched'
          @text = {
            title: $translate.instant('listings.additional_listings.title')
            subtitle: $translate.instant('listings.additional_listings.subtitle')
            showResults: $translate.instant('listings.additional_listings.show')
            hideResults: $translate.instant('listings.additional_listings.hide')
          }
        when 'upcomingLotteries'
          @text = {
            title: $translate.instant('listings.upcoming_lotteries.title')
            subtitle: $translate.instant('listings.upcoming_lotteries.subtitle')
            showResults: $translate.instant('listings.upcoming_lotteries.show')
            hideResults: $translate.instant('listings.upcoming_lotteries.hide')
            noResults: $translate.instant('listings.upcoming_lotteries.no_results')
          }

    @toggleListings = (e) ->
      # When you use keyboard nav to click on the button inside the header
      # for some reason it triggers both a MouseEvent and KeyboardEvent.
      # So, we ignore the KeyboardEvent.
      return if e.constructor.name == 'KeyboardEvent' and angular.element(e.target).hasClass('button')
      e.currentTarget.blur() if e
      @displayToggledSection = !@displayToggledSection
      @toggleStates[@sectionName] = @displayToggledSection

    return ctrl
  ]
