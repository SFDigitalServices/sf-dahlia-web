do ->
  'use strict'
  describe 'ShortFormNavigationService', ->
    ShortFormNavigationService = undefined
    $state = undefined
    application =
      householdMembers: []
    sections = [
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

    beforeEach module('ui.router')
    beforeEach module('dahlia.services', ($provide)->
      return
    )

    beforeEach inject((_ShortFormNavigationService_, _$state_) ->
      $state = _$state_
      ShortFormNavigationService = _ShortFormNavigationService_
      return
    )

    describe 'Service setup', ->
      it 'initializes defaults', ->
        expect(ShortFormNavigationService.sections).toEqual sections
        return

    describe 'hasNav', ->
      it 'checks if section does not have nav enabled', ->
        $state.current.name = 'dahlia.short-form-welcome.intro'
        hasNav = ShortFormNavigationService.hasNav()
        expect(hasNav).toEqual false
        return
      it 'checks if section has nav enabled', ->
        $state.current.name = 'dahlia.short-form-application.name'
        hasNav = ShortFormNavigationService.hasNav()
        expect(hasNav).toEqual true
        return

    describe 'hasBackButton', ->
      it 'checks if section does not have back button enabled', ->
        $state.current.name = 'dahlia.short-form-welcome.intro'
        hasNav = ShortFormNavigationService.hasBackButton()
        expect(hasNav).toEqual false
        return
      it 'checks if section has back button enabled', ->
        $state.current.name = 'dahlia.short-form-application.contact'
        hasNav = ShortFormNavigationService.hasBackButton()
        expect(hasNav).toEqual true
        return

    describe 'activeSection', ->
      it 'gets the active section of the current page', ->
        $state.current.name = 'dahlia.short-form-application.status-programs'
        activeSection = ShortFormNavigationService.activeSection()
        expect(activeSection.name).toEqual 'Status'
        return

    describe 'backPageState', ->
      it 'gets the previous page to be used by the back button', ->
        $state.current.name = 'dahlia.short-form-application.contact'
        previousState = ShortFormNavigationService.backPageState(application)
        expect(previousState).toEqual $state.href('dahlia.short-form-application.name')
        return

    describe 'getLandingPage', ->
      it 'gets the first page of the section if it\'s not Household', ->
        section = ShortFormNavigationService.sections[0]
        page = ShortFormNavigationService.getLandingPage(section, application)
        expect(page).toEqual section.pages[0]
        return
      it 'gets household intro page if no householdMembers', ->
        householdSection = ShortFormNavigationService.sections[1]
        page = ShortFormNavigationService.getLandingPage(householdSection, application)
        expect(page).toEqual 'household-intro'
        return
      it 'gets household members page if householdMembers', ->
        householdSection = ShortFormNavigationService.sections[1]
        application.householdMembers = [{first_name: 'Joe'}]
        page = ShortFormNavigationService.getLandingPage(householdSection, application)
        expect(page).toEqual 'household-members'
        return
