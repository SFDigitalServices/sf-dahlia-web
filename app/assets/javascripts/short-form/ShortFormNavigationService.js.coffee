ShortFormNavigationService = ($state, ShortFormApplicationService) ->
  Service = {}
  Service.loading = false
  Service.sections = [
    { name: 'You', pages: [
        'name',
        'contact',
        'verify-address',
        'alternate-contact-type',
        'alternate-contact-name',
        'alternate-contact-phone-address',
      ]
    },
    { name: 'Household', pages: [
        'household-intro',
        'household-overview',
        'household-members',
        'household-member-form',
        'household-member-form-edit'
      ]
    },
    { name: 'Status', pages: [
        'status-programs',
        'live-work-preference',
        'general-lottery-notice',
        'status-vouchers'
      ]
    },
    { name: 'Income', pages: [
        'income'
      ]
    },
    { name: 'Review', pages: [
        'review-optional',
        'review-summary',
        'review-terms'
      ]
    }
  ]

  Service.submitActions =
    'name': {path: 'contact'}
    'contact': {callback: 'checkIfAddressVerificationNeeded'}
    'verify-address': {path: 'alternate-contact-type'}
    'alternate-contact-type': {callback: 'checkIfAlternateContactInfoNeeded'}
    'alternate-contact-name': {path: 'alternate-contact-phone-address'}
    'alternate-contact-phone-address': {callback: 'goToHouseholdLandingPage'}
    'household-members': {callback: 'validateHouseholdEligibility', params: 'householdMatch'}
    'household-member-form': {callback: 'addHouseholdMember'}
    'household-member-verify-address': {path: 'household-members'}
    'status-programs': {callback: 'checkIfPreferencesApply'}
    'live-work-preference': {path: 'status-vouchers'}
    'general-lottery-notice': {path: 'status-vouchers'}
    'status-vouchers': {path: 'income'}
    'income': {callback: 'validateHouseholdEligibility', params: 'incomeMatch'}
    'review-optional': {path: 'review-summary', callback: 'checkSurveyComplete'}
    'review-summary': {path: 'review-terms'}
    'review-terms': {callback: 'submitApplication'}

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

  Service.hasNav = ->
    hideNav = ['intro', 'confirmation']
    hideNav.indexOf(Service._currentPage()) < 0

  Service.hasBackButton = ->
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
        ,'review-terms'
        ,'live-work-preference'
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
      # -- Status
      when 'status-programs'
        if application.householdMembers.length
          'household-members'
        else
          'household-intro'
      when 'general-lottery-notice'
        'status-programs'
      when 'status-vouchers'
        if ShortFormApplicationService.preferencesApplyForHousehold()
          'live-work-preference'
        else
          'status-programs'
      # -- catch all
      else
        'intro'
    $state.href("dahlia.short-form-application.#{page}")

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
    Service._sectionOfPage(Service._getSuffix(state.name))

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

ShortFormNavigationService.$inject = ['$state', 'ShortFormApplicationService']

angular
  .module('dahlia.services')
  .service('ShortFormNavigationService', ShortFormNavigationService)
