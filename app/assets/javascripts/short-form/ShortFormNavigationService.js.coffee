ShortFormNavigationService = (
  $state,
  bsLoadingOverlayService,
  ShortFormApplicationService,
  AccountService
) ->
  Service = {}
  RESERVED_TYPES = ShortFormApplicationService.RESERVED_TYPES
  Service.loading = false
  Service.sections = [
    {
      name: 'You',
      translatedLabel: 'SHORT_FORM_NAV.YOU',
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
      translatedLabel: 'SHORT_FORM_NAV.HOUSEHOLD',
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
      ]
    },
    {
      name: 'Income',
      translatedLabel: 'SHORT_FORM_NAV.INCOME',
      pages: [
        'income-vouchers'
        'income'
      ]
    },
    {
      name: 'Preferences',
      translatedLabel: 'SHORT_FORM_NAV.PREFERENCES',
      pages: [
        'preferences-intro'
        'assisted-housing-preference'
        'rent-burdened-preference'
        'rent-burdened-preference-edit'
        'neighborhood-preference'
        'adhp-preference'
        'live-work-preference'
        'preferences-programs'
        'custom-preferences'
        'custom-proof-preferences'
        'general-lottery-notice'
      ]
    },
    {
      name: 'Review',
      translatedLabel: 'SHORT_FORM_NAV.REVIEW',
      pages: [
        'review-optional'
        'review-summary'
        'review-terms'
      ]
    }
  ]

  Service.submitActions =
    # intro
    'community-screening': {callback: ['validateCommunityEligibility']}
    # you
    'name': {callback: ['checkAfterNamePage']}
    'contact': {callback: ['checkIfAddressVerificationNeeded', 'checkPreferenceEligibility']}
    'verify-address': {path: 'alternate-contact-type', callback: ['checkPreferenceEligibility']}
    'alternate-contact-type': {callback: ['checkIfAlternateContactInfoNeeded']}
    'alternate-contact-name': {path: 'alternate-contact-phone-address'}
    'alternate-contact-phone-address': {callback: ['goToLandingPage'], params: 'Household'}
    # household
    'household-intro': {callback: ['validateHouseholdEligibility'], params: 'householdMatch'}
    'household-members': {callback: ['validateHouseholdEligibility'], params: 'householdMatch'}
    'household-member-form': {callback: ['addHouseholdMember', 'checkPreferenceEligibility']}
    'household-member-form-edit': {callback: ['addHouseholdMember', 'checkPreferenceEligibility']}
    'household-member-verify-address': {path: 'household-members', callback: ['checkPreferenceEligibility']}
    'household-public-housing': {callback: ['checkIfPublicHousing']}
    'household-monthly-rent': {callback: ['checkIfReservedUnits']}
    'household-reserved-units-veteran': {callback: ['checkIfReservedUnits'], params: RESERVED_TYPES.DISABLED}
    'household-reserved-units-disabled': {path: 'household-priorities'}
    'household-priorities': {path: 'income-vouchers'}
    # income
    'income-vouchers': {path: 'income'}
    'income': {callback: ['validateHouseholdEligibility'], params: 'incomeMatch'}
    # preferences
    'preferences-intro': {callback: ['checkIfPreferencesApply']}
    'assisted-housing-preference': {callback: ['checkForNeighborhoodOrLiveWork']}
    'rent-burdened-preference': {callback: ['checkForRentBurdenFiles']}
    'rent-burdened-preference-edit': {path: 'rent-burdened-preference'}
    'neighborhood-preference': {callback: ['checkAfterLiveInTheNeighborhood'], params: 'neighborhoodResidence'}
    'adhp-preference': {callback: ['checkAfterLiveInTheNeighborhood'], params: 'antiDisplacement'}
    'live-work-preference': {callback: ['checkAfterLiveWork']}
    'preferences-programs': {callback: ['checkForCustomPreferences']}
    'custom-preferences': {callback: ['checkForCustomProofPreferences']}
    'custom-proof-preferences': {callback: ['checkForCustomProofPreferences']}
    'general-lottery-notice': {callback: ['goToLandingPage'], params: 'Review'}
    # review
    'review-optional': {path: 'review-summary', callback: ['checkSurveyComplete']}
    'review-summary': {path: 'review-terms'}
    'review-terms': {callback: ['submitApplication']}
    # save + finish workflow
    'choose-draft': {callback: ['chooseDraft']}
    'choose-applicant-details': {callback: ['chooseApplicantDetails']}

  Service.submitOptionsForCurrentPage = ->
    options = angular.copy(Service.submitActions[Service._currentPage()] || {})
    options.path = "dahlia.short-form-application.#{options.path}" if options.path
    options

  Service.getLandingPage = (section) ->
    application = ShortFormApplicationService.application
    switch section.name
      when 'Household'
        if application.householdMembers.length
          'household-members'
        else
          'household-intro'
      when 'Income'
        'income-vouchers'
      when 'Preferences'
        'preferences-intro'
      when 'Review'
        if application.surveyComplete
          'review-summary'
        else
          'review-optional'
      else
        section.pages[0]

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
      'overview',
      'name',
      'verify-address',
      'household-members',
      'household-member-form',
      'household-member-form-edit',
      'household-member-verify-address',
      'rent-burdened-preference-edit',
      'review-summary',
      'confirmation'
    ]
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
        ,'income'
        ,'preferences-intro'
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
        Service.getNextReservedPageIfAvailable(RESERVED_TYPES.VETERAN, 'prev')
      when 'household-priorities'
        Service.getNextReservedPageIfAvailable(RESERVED_TYPES.DISABLED, 'prev')
      # -- Income
      when 'income-vouchers'
        'household-priorities'
      # -- Preferences
      when 'rent-burdened-preference'
        , 'assisted-housing-preference'
          'preferences-programs'
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
      when 'preferences-programs'
        Service.goBackToLiveWorkNeighborhood()
      when 'custom-preferences'
        'preferences-programs'
      when 'custom-proof-preferences'
        Service.getPrevPageOfCustomProofPref()
      when 'general-lottery-notice'
        Service.getPrevPageOfGeneralLottery()
      # -- Review
      when 'review-optional'
        if ShortFormApplicationService.applicantHasNoPreferences()
          'general-lottery-notice'
        else
          'preferences-programs'
      when 'review-submitted'
        'confirmation'
      # -- catch all
      else
        'intro'
    page

  Service.getNextReservedPageIfAvailable = (type = RESERVED_TYPES.VETERAN, dir = 'next') ->
    hasType = ShortFormApplicationService.listingHasReservedUnitType(type)
    switch type
      when RESERVED_TYPES.VETERAN
        if hasType
          'household-reserved-units-veteran'
        else
          if dir == 'next'
            # move on to the next type
            Service.getNextReservedPageIfAvailable(RESERVED_TYPES.DISABLED, 'next')
          else
            Service.getPrevPageOfHouseholdSection()
      when RESERVED_TYPES.DISABLED
        if hasType
          'household-reserved-units-disabled'
        else
          if dir == 'next'
            # once we've gotten to the end of our types, go to Income
            'household-priorities'
          else
            Service.getNextReservedPageIfAvailable(RESERVED_TYPES.VETERAN, 'prev')


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
    hasCustomPreferences = !!ShortFormApplicationService.listing.customPreferences.length
    currentIndex = parseInt($state.params.prefIdx)
    if currentIndex == 0 && hasCustomPreferences
      'custom-preferences'
    else if currentIndex == 0 && !hasCustomPreferences
      'preferences-programs'
    else if currentIndex > 0
      "custom-proof-preferences({prefIdx: #{currentIndex - 1}})"

  Service.getPrevPageOfGeneralLottery = ->
    customProofPreferences = ShortFormApplicationService.listing.customProofPreferences
    hasCustomPreferences = !!ShortFormApplicationService.listing.customPreferences.length
    if customProofPreferences.length
      "custom-proof-preferences({prefIdx: #{customProofPreferences.length - 1}})"
    else if hasCustomPreferences
      'custom-preferences'
    else
      'preferences-programs'

  Service.getStartOfHouseholdDetails = ->
    # This returns the page in the household section that comes directly after
    # the household members page
    application = ShortFormApplicationService.application
    listing = ShortFormApplicationService.listing
    return '' if application.status.toLowerCase() == 'submitted'
    if application.hasPublicHousing
      'household-public-housing'
    else if ShortFormApplicationService.listingHasReservedUnitType(RESERVED_TYPES.VETERAN)
      'household-reserved-units-veteran'
    else if ShortFormApplicationService.listingHasReservedUnitType(RESERVED_TYPES.DISABLED)
      'household-reserved-units-disabled'
    else
      'household-priorities'

  Service._currentPage = () ->
    Service._getSuffix($state.current.name)

  Service._getSuffix = (stateName) ->
    stateName.replace(/dahlia.short-form-(welcome|application)\./, "")

  Service._getPreviousPage = () ->
    pages = _.flatten _.map(Service.sections, (section) -> section.pages)
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
    Service.sections.forEach (section) ->
      if section.pages.indexOf(stateName) > -1
        currentSection = section
    return currentSection

  Service._sectionNames = () ->
    Service.sections.map (section) ->
      return section.name

  return Service

ShortFormNavigationService.$inject = [
  '$state',
  'bsLoadingOverlayService',
  'ShortFormApplicationService',
  'AccountService'
]

angular
  .module('dahlia.services')
  .service('ShortFormNavigationService', ShortFormNavigationService)
