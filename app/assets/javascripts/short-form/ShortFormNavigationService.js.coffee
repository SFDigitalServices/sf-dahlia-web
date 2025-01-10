ShortFormNavigationService = (
  $state,
  AccountService, AnalyticsService, bsLoadingOverlayService,
  ListingConstantsService, ListingIdentityService, ShortFormApplicationService,
  SharedService
) ->
  Service = {}
  Service.RESERVED_TYPES = ListingConstantsService.RESERVED_TYPES
  Service.loading = false

  Service.showVeteransApplicationQuestion = ->
    SharedService.showVeteransApplicationQuestion(ShortFormApplicationService.listing)

  Service.goToApplicationPage = (path, params) ->
    # Every time the user completes an application page,
    # we track that in GTM/GA as a form success.
    AnalyticsService.trackFormSuccess('Application Page View')
    if params
      $state.go(path, params)
    else
      $state.go(path)

  Service.getStartOfSection = (section) ->
    application = ShortFormApplicationService.application
    switch section.name
      when 'Household'
        if application.householdMembers.length
          'household-members'
        else
          'household-intro'
      when 'Income'
        if Service.showIncomeVouchersPage(ShortFormApplicationService.listing)
          'income-vouchers'
        else
          'income'
      when 'Preferences'
        'preferences-intro'
      when 'Review'
        'review-optional'
      else
        section.pages[0]

  Service.goToSection = (section) ->
    page = Service.getStartOfSection({name: section})
    Service.goToApplicationPage("dahlia.short-form-application.#{page}")

  # Logic for whether household-priorities page should show.
  # We show it for all rentals, and for Sale listings that are
  # accessible units only.
  Service.showHouseholdPrioritiesPage = (listing) ->
    (listing && _.includes(ListingConstantsService.HOUSEHOLD_PRIORITIES_LISTINGS_IDS, listing.Id)) ||
    ListingIdentityService.isRental(listing) ||
    (listing?.Reserved_community_type == ListingConstantsService.RESERVED_TYPES.ACCESSIBLE_ONLY)

  Service.showIncomeVouchersPage = (listing) ->
    ListingIdentityService.isRental(listing)

  Service.getPostReservedPage = (listing) ->
    # Don't show ADA priorities on Sale listings unless they
    # are reserved for accessible units only.
    if Service.showHouseholdPrioritiesPage(listing)
      'household-priorities'
    else
      'income'

  Service.getPostHouseholdPrioritiesPage = (listing) ->
    if ShortFormApplicationService.listingHasHomeAndCommunityBasedServicesUnits(listing)
      'home-and-community-based-services'
    else if Service.showIncomeVouchersPage(listing)
      'income-vouchers'
    else
      'income'

  Service.getPostHomeAndCommunityBasedServicesPage = (listing) ->
    if Service.showIncomeVouchersPage(listing)
      'income-vouchers'
    else
      'income'

  # TODO: Refactor the way we handle post-submit actions for short form pages
  # so that this submitActions function is not so closely coupled to the
  # handleFormSuccess function in the ShortFormApplicationController. Do not
  # have this function handling names of functions that are defined in
  # ShortFormApplicationController.
  #
  # Right now, submitActions returns an object whose keys are the short form page
  # slugs and whose values are objects that can contain three types of values :
  #  - path: a string state name to go to
  #  - callbacks: an array of functions to call
  #  - scopedCallbacks: an array of objects of the format:
  #    - func: a string function name
  #    - param: a param to be passed to the function named in func
  # The function names in scopedCallbacks are meant to be called on the scope of
  # the ShortFormApplicationController. We very much do not want to maintain this
  # paradigm! But at the moment we don't have time to refactor how this works. We
  # plan in the future to refactor the entire way the short form application is
  # set up and the way navigation works between pages, so this paradigm will
  # definitely be removed and replaced at that time.
  Service.submitActions =
    # intro
    'community-screening':
      scopedCallbacks: [{func: 'validateCommunityEligibility'}]
    'custom-educator-screening':
      scopedCallbacks: [{func: 'customEducatorValidateEligibility'}]
    'dalp-screening':
      scopedCallbacks: [{func: 'afterDalpScreening'}]
    # you
    'prerequisites':
      callbacks: [
        Service.goToApplicationPage.bind(null, 'dahlia.short-form-application.name')
      ]
    'name':
      scopedCallbacks: [{func: 'checkAfterNamePage'}]
    'contact':
      scopedCallbacks: [
        {func: 'checkIfAddressVerificationNeeded'}
        {func: 'checkPreferenceEligibility'}
      ]
    'verify-address':
      scopedCallbacks: [{func: 'checkPreferenceEligibility'}]
      path: 'alternate-contact-type'
    'alternate-contact-type':
      scopedCallbacks: [{func: 'checkIfAlternateContactInfoNeeded'}]
    'alternate-contact-name':
      path: 'alternate-contact-phone-address'
    'alternate-contact-phone-address':
      callbacks: [Service.goToSection.bind(null, 'Household')]
    # household
    'household-intro':
      scopedCallbacks: [{
        func: 'validateHouseholdEligibility'
        param: 'householdMatch'
      }]
    'household-members':
      scopedCallbacks: [{
        func: 'validateHouseholdEligibility'
        param: 'householdMatch'
      }]
    'household-member-form':
      scopedCallbacks: [
        {func: 'addHouseholdMember'}
        {func: 'checkPreferenceEligibility'}
      ]
    'household-member-form-edit':
      scopedCallbacks: [
        {func: 'addHouseholdMember'}
        {func: 'checkPreferenceEligibility'}
      ]
    'household-member-verify-address':
      scopedCallbacks: [{func: 'checkPreferenceEligibility'}]
      path: 'household-members'
    'household-public-housing': {scopedCallbacks: [{func: 'checkIfPublicHousing'}]}
    'household-monthly-rent': {scopedCallbacks: [{func: 'goToNextReservedPageIfAvailable'}]}
    'household-reserved-units-veteran':
      scopedCallbacks: [{
        func: 'goToNextReservedPageIfAvailable'
        param: Service.RESERVED_TYPES.DISABLED
      }]
    'household-reserved-units-disabled':
      # FIXME: This won't work because it gets called when this file is loaded and doesn't have the right scope.
      path: Service.getPostReservedPage(ShortFormApplicationService.listing)
    'household-priorities': {
      # This needs to be a callback to call with the right listing
      scopedCallbacks: [{func: 'goToPostHouseholdPrioritiesPage'}]
    }
    'home-and-community-based-services': {
      scopedCallbacks: [{func: 'goToPostHomeAndCommunityBasedServicesPage'}]
    }
    # income
    'income-vouchers': {path: 'income'}
    'income':
      scopedCallbacks: [{
        func: 'validateHouseholdEligibility'
        param: 'incomeMatch'
      }]
    # preferences
    'preferences-intro': {scopedCallbacks: [{func: 'checkIfPreferencesApply'}]}
    'assisted-housing-preference': {scopedCallbacks: [{func: 'checkForNeighborhoodOrLiveWork'}]}
    'rent-burdened-preference': {scopedCallbacks: [{func: 'checkForRentBurdenFiles'}]}
    'rent-burdened-preference-edit': {path: 'rent-burdened-preference'}
    'neighborhood-preference':
      scopedCallbacks: [{
        func: 'checkAfterLiveInTheNeighborhood'
        param: 'neighborhoodResidence'
      }]
    'adhp-preference':
      scopedCallbacks: [{
        func: 'checkAfterLiveInTheNeighborhood'
        param: 'antiDisplacement'
      }]
    'live-work-preference': {scopedCallbacks: [{func: 'checkAfterLiveWork'}]}
    'right-to-return-preference': {scopedCallbacks: [{func: 'checkAliceGriffithAddress'}]}
    'alice-griffith-verify-address': {path: 'preferences-programs'}
    'preferences-programs': {scopedCallbacks: [{func: 'checkAfterPreferencesPrograms'}]}
    'veterans-preference': {scopedCallbacks: [{func: 'checkAfterVeteransPreference'}]}
    'custom-preferences': {scopedCallbacks: [{func: 'checkForCustomProofPreferences'}]}
    'custom-proof-preferences': {scopedCallbacks: [{func: 'checkForCustomProofPreferences'}]}
    'general-lottery-notice': {scopedCallbacks: [{func: 'goToDemographicsPageUnlessAutofilled'}]}
    # review
    # TODO -> not sure what this does, just says the next page?
    'review-optional': {path: 'review-summary'}
    'review-summary': {path: 'review-terms'}
    'review-terms': {scopedCallbacks: [{func: 'submitApplication'}]}
    # save + finish workflow
    'choose-draft': {scopedCallbacks: [{func: 'chooseDraft'}]}
    'choose-applicant-details': {scopedCallbacks: [{func: 'chooseApplicantDetails'}]}

  Service.sections = () ->
    sections = [
      {
        name: 'Qualify',
        translatedLabel: 'short_form_nav.qualify',
        pages: [
          'prerequisites'
        ]
      },
      {
        name: 'You',
        translatedLabel: 'short_form_nav.you',
        pages: [
          'name'
          'welcome-back'
          'contact'
          'verify-address'
          'alternate-contact-type'
          'alternate-contact-name'
          'alternate-contact-phone-address'
        ]
      },
      {
        name: 'Household',
        translatedLabel: 'short_form_nav.household',
        pages: [
          'household-intro'
          'household-overview'
          'household-members'
          'household-member-form'
          'household-member-form-edit'
          'household-public-housing'
          'household-monthly-rent'
          'household-reserved-units-veteran'
          'household-reserved-units-disabled'
          'household-priorities'
          'home-and-community-based-services'
        ]
      },
      {
        name: 'Income',
        translatedLabel: 'short_form_nav.income',
        pages: [
          'income-vouchers'
          'income'
        ]
      },
      {
        name: 'Preferences',
        translatedLabel: 'short_form_nav.preferences',
        pages: [
          'preferences-intro'
          'assisted-housing-preference'
          'rent-burdened-preference'
          'rent-burdened-preference-edit'
          'neighborhood-preference'
          'adhp-preference'
          'live-work-preference'
          'right-to-return-preference'
          'alice-griffith-verify-address'
          'preferences-programs'
          'veterans-preference'
          'custom-preferences'
          'custom-proof-preferences'
          'general-lottery-notice'
        ]
      },
      {
        name: 'Review',
        translatedLabel: 'short_form_nav.review',
        pages: [
          'review-optional'
          'review-summary'
          'review-terms'
        ]
      }
    ]
    listing = ShortFormApplicationService.listing
    if listing && ListingIdentityService.isRental(listing)
      sections.shift()
    if listing && ShortFormApplicationService.listingIsDalp()
      sections.splice(4, 1)
    sections

  Service.submitOptionsForCurrentPage = ->
    options = angular.copy(Service.submitActions[Service._currentPage()] || {})
    options.path = "dahlia.short-form-application.#{options.path}" if options.path
    options

  Service.isLoading = (bool = null) ->
    if bool == null
      return Service.loading
    else
      Service.loading = bool
      if Service.loading
        bsLoadingOverlayService.start()
      else
        bsLoadingOverlayService.stop()

  Service.hasNav = ->
    hideNav = ['intro', 'confirmation']
    hideNav.indexOf(Service._currentPage()) < 0

  Service.hasBackButton = ->
    return false if $state.current.name == 'dahlia.short-form-review'
    hideBackButton = [
      'intro',
      'community-screening',
      'custom-educator-screening',
      'overview',
      'verify-address',
      'household-members',
      'household-member-form',
      'household-member-form-edit',
      'household-member-verify-address',
      'rent-burdened-preference-edit',
      'alice-griffith-verify-address',
      'review-summary',
      'confirmation',
      'prerequisites'
    ]
    if ListingIdentityService.isRental(ShortFormApplicationService.listing)
      hideBackButton.push('name')
    hideBackButton.indexOf(Service._currentPage()) < 0

  Service.isActiveSection = (section) ->
    section.pages.indexOf(Service._currentPage()) > -1

  Service.isPreviousSection = (section) ->
    _sectionNames = Service._sectionNames()
    if Service.activeSection()
      indexOfActiveSection = _sectionNames.indexOf(Service.activeSection().name)
      indexofSection = _sectionNames.indexOf(section.name)
      indexofSection < indexOfActiveSection

  Service.activeSection = () ->
    Service._sectionOfPage(Service._currentPage())

  Service.backPageState = ->
    "dahlia.short-form-application.#{Service.previousPage()}"

  Service.previousPage = ->
    application = ShortFormApplicationService.application
    page = switch Service._currentPage()
      # -- Pages that follow normal deterministic order
      when 'welcome-back'
        ,'alternate-contact-name'
        ,'alternate-contact-phone-address'
        ,'household-overview'
        ,'preferences-intro'
        # prev page is not deterministic for review-summary (we may skip demographics page)
        # but it doesn't matter because we hide the back button for this page
        ,'review-summary'
        ,'review-terms'
          Service._getPreviousPage()
      # -- Contact
      when 'contact'
        'name'
      # -- Alt Contact
      when 'alternate-contact-type'
        'contact'
      # -- Household
      when 'household-intro'
        if application.alternateContact.alternateContactType == 'None'
          'alternate-contact-type'
        else
          'alternate-contact-phone-address'
      when 'household-public-housing'
        if application.householdMembers.length
          'household-members'
        else
          'household-intro'
      when 'household-monthly-rent'
        'household-public-housing'
      when 'household-reserved-units-veteran'
        Service.getPrevPageOfHouseholdSection()
      when 'household-reserved-units-disabled'
        Service.getNextReservedPageIfAvailable(Service.RESERVED_TYPES.VETERAN, 'prev')
      when 'household-priorities'
        Service.getNextReservedPageIfAvailable(Service.RESERVED_TYPES.DISABLED, 'prev')
      when 'home-and-community-based-services'
        # to simplify navigation, let's assume home-and-community-based-services page's existence guarantees household-priorities page
        'household-priorities'
      # -- Income
      when 'income-vouchers'
        Service.getPrevPageOfIncomeVouchersPage()
      when 'income'
        Service.getPrevPageOfIncomePage()
      # -- Preferences
      when 'rent-burdened-preference'
        , 'assisted-housing-preference'
          'preferences-intro'
      when 'neighborhood-preference'
        , 'adhp-preference'
          Service.goBackToRentBurden()
      when 'live-work-preference'
        if ShortFormApplicationService.eligibleForNRHP()
          'neighborhood-preference'
        else if ShortFormApplicationService.eligibleForADHP()
          'adhp-preference'
        else
          Service.goBackToRentBurden()
      when 'right-to-return-preference'
        Service.goBackToLiveWorkNeighborhood()
      when 'preferences-programs'
        if ShortFormApplicationService.listingHasRTRPreference()
          'right-to-return-preference'
        else
          Service.goBackToLiveWorkNeighborhood()
      when 'veterans-preference'
        'preferences-programs'
      when 'custom-preferences'
        if Service.showVeteransApplicationQuestion()
          'veterans-preference'
        else
          'preferences-programs'
      when 'custom-proof-preferences'
        Service.getPrevPageOfCustomProofPref()
      when 'general-lottery-notice'
        Service.getPrevPageOfGeneralLottery()
      # -- Review
      when 'review-optional'
        if ShortFormApplicationService.listingIsDalp()
          'income'
        else if ShortFormApplicationService.applicantHasNoPreferences()
          'general-lottery-notice'
        else if Service.hasCustomPreferences()
          'custom-preferences'
        else if !Service.showVeteransApplicationQuestion()
          'preferences-programs'
        else
          'veterans-preference'
      when 'review-submitted'
        'confirmation'
      when 'name'
        'prerequisites'
      # -- catch all
      else
        'intro'
    page

  Service.getNextReservedPageIfAvailable = (type = Service.RESERVED_TYPES.VETERAN, dir = 'next') ->
    hasType = ShortFormApplicationService.listingHasReservedUnitType(type)
    switch type
      when Service.RESERVED_TYPES.VETERAN
        if hasType
          'household-reserved-units-veteran'
        else
          if dir == 'next'
            # move on to the next type
            Service.getNextReservedPageIfAvailable(Service.RESERVED_TYPES.DISABLED, 'next')
          else
            Service.getPrevPageOfHouseholdSection()
      when Service.RESERVED_TYPES.DISABLED
        if hasType
          'household-reserved-units-disabled'
        else
          if dir == 'next'
            # once we've gotten to the end of our types, go to the appropriate
            # next page for the listing
            Service.getPostReservedPage(ShortFormApplicationService.listing)
          else
            Service.getNextReservedPageIfAvailable(Service.RESERVED_TYPES.VETERAN, 'prev')

  Service.getPrevPageOfHouseholdSection = ->
    application = ShortFormApplicationService.application
    if application.hasPublicHousing == 'No'
      'household-monthly-rent'
    else if application.hasPublicHousing == 'Yes'
      'household-public-housing'
    else if application.householdMembers.length
      'household-members'
    else
      'household-intro'

  Service.getPrevPageOfIncomeVouchersPage = ->
    listing = ShortFormApplicationService.listing
    if !Service.showHouseholdPrioritiesPage(listing)
      Service.getNextReservedPageIfAvailable(Service.RESERVED_TYPES.DISABLED, 'prev')
    else if ShortFormApplicationService.listingHasHomeAndCommunityBasedServicesUnits(listing)
      'home-and-community-based-services'
    else
      'household-priorities'

  Service.getPrevPageOfIncomePage = ->
    listing = ShortFormApplicationService.listing
    if !Service.showHouseholdPrioritiesPage(listing)
      Service.getNextReservedPageIfAvailable(Service.RESERVED_TYPES.DISABLED, 'prev')
    else if Service.showIncomeVouchersPage(listing)
      'income-vouchers'
    else if ShortFormApplicationService.listingHasHomeAndCommunityBasedServicesUnits(listing)
      'home-and-community-based-services'
    else
      'household-priorities'

  Service.goBackToRentBurden = ->
    if ShortFormApplicationService.eligibleForAssistedHousing()
      'assisted-housing-preference'
    else if ShortFormApplicationService.eligibleForRentBurden()
      'rent-burdened-preference'
    else
      'preferences-intro'

  Service.goBackToLiveWorkNeighborhood = ->
    if ShortFormApplicationService.applicationHasPreference('neighborhoodResidence')
      'neighborhood-preference'
    else if ShortFormApplicationService.applicationHasPreference('antiDisplacement')
      'adhp-preference'
    else if ShortFormApplicationService.eligibleForLiveWork()
      'live-work-preference'
    else
      Service.goBackToRentBurden()

  Service.getPrevPageOfCustomProofPref = ->
    currentIndex = parseInt($state.params.prefIdx)
    if currentIndex == 0 && Service.hasCustomPreferences()
      'custom-preferences'
    else if currentIndex == 0 && !Service.hasCustomPreferences()
      'preferences-programs'
    else if currentIndex > 0
      "custom-proof-preferences({prefIdx: #{currentIndex - 1}})"

  Service.getPrevPageOfGeneralLottery = ->
    customProofPreferences = ShortFormApplicationService.listing.customProofPreferences
    if customProofPreferences.length
      "custom-proof-preferences({prefIdx: #{customProofPreferences.length - 1}})"
    else if Service.hasCustomPreferences()
      'custom-preferences'
    else if !Service.showVeteransApplicationQuestion()
      'preferences-programs'
    else
      'veterans-preference'

  Service.getStartOfHouseholdDetails = ->
    # This returns the page in the household section that comes directly after
    # the household members page
    application = ShortFormApplicationService.application
    return '' if application.status.toLowerCase() == 'submitted'
    listing = ShortFormApplicationService.listing

    if application.hasPublicHousing
      'household-public-housing'
    else if ShortFormApplicationService.listingHasReservedUnitType(Service.RESERVED_TYPES.VETERAN)
      'household-reserved-units-veteran'
    else if ShortFormApplicationService.listingHasReservedUnitType(Service.RESERVED_TYPES.DISABLED)
      'household-reserved-units-disabled'
    else if !Service.showHouseholdPrioritiesPage(listing)
      ''
    else
      'household-priorities'

  Service.redirectIfNoApplication = (listing) ->
    applicationDataExists = !!ShortFormApplicationService.application.lotteryNumber
    return if applicationDataExists

    # if there is no application data, redirect to first page of listing application
    # (which will then redirect to community screening question, if applicable)
    $state.go('dahlia.short-form-application.name', { id: listing.Id }) if listing and listing.Id

  Service._currentPage = () ->
    Service._getSuffix($state.current.name)

  Service._getSuffix = (stateName) ->
    stateName.replace(/dahlia.short-form-(welcome|application)\./, "")

  Service._getPreviousPage = () ->
    pages = _.flatten _.map(Service.sections(), (section) -> section.pages)
    index = pages.indexOf(Service._currentPage())
    return pages[index - 1]

  Service.getShortFormSectionFromState = (state) ->
    return false unless state.name.match(/dahlia.short-form-application\./)
    # store in ShortFormApplicationService
    section = Service._sectionOfPage(Service._getSuffix(state.name))
    ShortFormApplicationService.activeSection = section
    section

  Service._sectionOfPage = (stateName) ->
    currentSection = null
    Service.sections().forEach (section) ->
      if section.pages.indexOf(stateName) > -1
        currentSection = section
    return currentSection

  Service._sectionNames = () ->
    Service.sections().map (section) ->
      return section.name
  Service.hasCustomPreferences = () ->
    !!ShortFormApplicationService.listing.customPreferences.length

  Service.initialState = () ->
    if ListingIdentityService.isSale(ShortFormApplicationService.listing)
      'dahlia.short-form-application.prerequisites'
    else
      'dahlia.short-form-application.name'

  return Service

ShortFormNavigationService.$inject = [
  '$state',
  'AccountService', 'AnalyticsService', 'bsLoadingOverlayService',
  'ListingConstantsService', 'ListingIdentityService', 'ShortFormApplicationService',
  'SharedService'
]

angular
  .module('dahlia.services')
  .service('ShortFormNavigationService', ShortFormNavigationService)
