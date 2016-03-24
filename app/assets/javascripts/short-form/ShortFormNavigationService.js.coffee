ShortFormNavigationService = ($state) ->
  Service = {}
  Service.sections = [
    { name: 'You', pages: [
        'name',
        'contact',
        'alternate-contact-type',
        'alternate-contact-name',
        'alternate-contact-phone-address',
        'optional-info'
      ]
    },
    { name: 'Household', pages: [''] },
    { name: 'Status', pages: [''] },
    { name: 'Income', pages: [''] },
    { name: 'Review', pages: [''] }
  ]

  Service.hasNav = ->
    $state.current.name != 'dahlia.short-form-application.intro'

  Service.isActiveSection = (section) ->
    section.pages.indexOf(Service.currentPage()) > -1

  Service.isPreviousSection = (section) ->
    sectionNames = Service.sectionNames()
    if Service.activeSection()
      indexOfActiveSection = sectionNames.indexOf(Service.activeSection().name)
      indexofSection = sectionNames.indexOf(section.name)
      indexofSection < indexOfActiveSection

  Service.currentIndexofSection = () ->
    Service.activeSection().pages.indexOf(Service.currentPage()) + 1

  Service.totalIndexofSection = () ->
    Service.activeSection().pages.length

  Service.currentPage = () ->
    $state.current.name.replace('dahlia.short-form-application.', "")

  Service.activeSection = () ->
    Service.sectionOfPage(Service.currentPage())

  Service.sectionOfPage = (stateName) ->
    currentSection = null
    Service.sections.forEach (section) ->
      if section.pages.indexOf(stateName) > -1
        currentSection = section
    return currentSection

  Service.sectionNames = () ->
    Service.sections.map (section) ->
      return section.name


  return Service

ShortFormNavigationService.$inject = ['$state']

angular
  .module('dahlia.services')
  .service('ShortFormNavigationService', ShortFormNavigationService)
