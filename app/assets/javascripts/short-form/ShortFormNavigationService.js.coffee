ShortFormNavigationService = ($state) ->
  Service = {}
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

  Service.getLandingPage = (section, application) ->
    if section.name == 'Household'
      if application.householdMembers.length
        'household-members'
      else
        'household-intro'
    else
      section.pages[0]


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

  Service.backPageState = (application) ->
    page = switch Service._currentPage()
      # -- Pages that follow normal deterministic order
      when 'contact'
        ,'alternate-contact-type'
        ,'alternate-contact-name'
        ,'alternate-contact-phone-address'
        ,'household-overview'
        ,'status-vouchers'
        ,'income'
        ,'review-optional'
        ,'review-summary'
        ,'review-terms'
        ,'live-work-preference'
          Service._getPreviousPage()
      # -- Household
      when 'household-intro'
        if application.alternateContact.type == 'None'
          'alternate-contact-type'
        else
          'alternate-contact-phone-address'
      # -- Status
      when 'status-programs'
        if application.householdMembers.length
          'household-members'
        else
          'household-intro'
      # -- catch all
      else
        'intro'
    $state.href("dahlia.short-form-application.#{page}")

  Service._currentPage = () ->
    $state.current.name.replace(/dahlia.short-form-(welcome|application)\./, "")

  Service._getPreviousPage = () ->
    pages = _.flatten _.map(Service.sections, (section) -> section.pages)
    index = pages.indexOf(Service._currentPage())
    return pages[index - 1]

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

ShortFormNavigationService.$inject = ['$state']

angular
  .module('dahlia.services')
  .service('ShortFormNavigationService', ShortFormNavigationService)
