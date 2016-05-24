ShortFormNavigationService = ($state) ->
  Service = {}
  Service.sections = [
    { name: 'You', pages: [
        'name',
        'contact',
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

  Service.hasNav = ->
    $state.current.name != 'dahlia.short-form-application.intro'

  Service.isActiveSection = (section) ->
    section.pages.indexOf(Service._currentPage()) > -1

  Service.isPreviousSection = (section) ->
    _sectionNames = Service._sectionNames()
    if Service.activeSection()
      indexOfActiveSection = _sectionNames.indexOf(Service.activeSection().name)
      indexofSection = _sectionNames.indexOf(section.name)
      indexofSection < indexOfActiveSection

  Service._currentPage = () ->
    $state.current.name.replace('dahlia.short-form-application.', "")

  Service.activeSection = () ->
    Service._sectionOfPage(Service._currentPage())

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
