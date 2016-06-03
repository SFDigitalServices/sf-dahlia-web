do ->
  'use strict'
  describe 'ShortFormNavigationService', ->
    ShortFormNavigationService = undefined
    $state = undefined
    application = {}
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
        $state.current.name = 'dahlia.short-form-application.intro'
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
        $state.current.name = 'dahlia.short-form-application.intro'
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
