ShortFormNavigationService = (
  $state,
  bsLoadingOverlayService,
  ShortFormApplicationService,
  AccountService
) ->
  Service = {}
  Service.loading = false
  Service.sections = [
    {
      name: 'You',
      translatedLabel: 'SHORT_FORM_NAV.YOU',
      pages: [
        'name'
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
        'household-intro',
        'household-overview',
        'household-members',
        'household-member-form',
        'household-member-form-edit'
      ]
    },
    {
      name: 'Preferences',
      translatedLabel: 'SHORT_FORM_NAV.PREFERENCES',
      pages: [
        'preferences-intro',
        'neighborhood-preference',
        'live-work-preference',
        'preferences-programs',
        'general-lottery-notice'
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
      name: 'Review',
      translatedLabel: 'SHORT_FORM_NAV.REVIEW',
      pages: [
        'review-optional'
        'review-summary'
        'review-sign-in'
        'review-terms'
      ]
    }
  ]

  Service.submitActions =
    'name': {path: 'contact'}
    'contact': {callback: ['checkIfAddressVerificationNeeded', 'checkPreferenceEligibility']}
    'verify-address': {path: 'alternate-contact-type', callback: ['checkPreferenceEligibility']}
    'alternate-contact-type': {callback: ['checkIfAlternateContactInfoNeeded']}
    'alternate-contact-name': {path: 'alternate-contact-phone-address'}
    'alternate-contact-phone-address': {callback: ['goToHouseholdLandingPage']}
    'household-members': {callback: ['validateHouseholdEligibility'], params: 'householdMatch'}
    'household-member-form': {callback: ['addHouseholdMember', 'checkPreferenceEligibility']}
    'household-member-form-edit': {callback: ['addHouseholdMember', 'checkPreferenceEligibility']}
    'household-member-verify-address': {path: 'household-members', callback: ['checkPreferenceEligibility']}
    'preferences-intro': {callback: ['checkIfPreferencesApply']}
    'neighborhood-preference': {callback: ['checkAfterNeighborhood']}
    'live-work-preference': {path: 'preferences-programs'}
    'preferences-programs': {callback: ['checkIfNoPreferencesSelected']}
    'general-lottery-notice': {path: 'income-vouchers'}
    'income-vouchers': {path: 'income'}
    'income': {callback: ['validateHouseholdEligibility'], params: 'incomeMatch'}
    'review-optional': {path: 'review-summary', callback: ['checkSurveyComplete']}
    'review-summary': {callback: ['confirmReviewedApplication']}
    'review-sign-in': {path: 'review-terms'}
    'review-terms': {callback: ['submitApplication']}
    'choose-draft': {callback: ['chooseDraft']}
    'choose-account-settings': {callback: ['chooseAccountSettings']}

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
      'overview',
      'name',
      'verify-address',
      'household-members',
      'household-member-form',
      'household-member-form-edit',
      'household-member-verify-address',
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
    $state.href("dahlia.short-form-application.#{Service.previousPage()}")

  Service.previousPage = ->
    application = ShortFormApplicationService.application
    page = switch Service._currentPage()
      # -- Pages that follow normal deterministic order
      when 'contact'
        ,'alternate-contact-name'
        ,'alternate-contact-phone-address'
        ,'household-overview'
        ,'income'
        ,'review-optional'
        ,'review-summary'
        ,'review-sign-in'
        ,'neighborhood-preference'
          Service._getPreviousPage()
      # -- Alt Contact
      when 'alternate-contact-type'
        'contact'
      # -- Household
      when 'household-intro'
        if application.alternateContact.alternateContactType == 'None'
          'alternate-contact-type'
        else
          'alternate-contact-phone-address'
      # -- Preferences
      when 'preferences-intro'
        if application.householdMembers.length
          'household-members'
        else
          'household-intro'
      when 'preferences-programs'
        if ShortFormApplicationService.hasPreference('neighborhoodResidence')
          'neighborhood-preference'
        else if ShortFormApplicationService.eligibleForLiveWork()
          'live-work-preference'
        else
          'preferences-intro'
      when 'live-work-preference'
        if ShortFormApplicationService.eligibleForNRHP()
          'neighborhood-preference'
        else
          'preferences-intro'
      when 'general-lottery-notice'
        'preferences-programs'
      when 'income-vouchers'
        if ShortFormApplicationService.applicantHasNoPreferences()
          'general-lottery-notice'
        else
          'preferences-programs'
      when 'review-terms'
        if AccountService.loggedIn()
          'review-summary'
        else
          'review-sign-in'
      when 'review-submitted'
        'confirmation'
      # -- catch all
      else
        'intro'
    page

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
