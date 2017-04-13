do ->
  'use strict'
  describe 'ShortFormNavigationService', ->
    ShortFormNavigationService = undefined
    $translate = {}
    $auth = {}
    $modal = {}
    Upload = {}
    uuid = {v4: jasmine.createSpy()}
    $state = undefined
    fakeShortFormApplicationService =
      application:
        householdMembers: []
        surveyComplete: false
      listingHasReservedUnitType: jasmine.createSpy()
      RESERVED_TYPES:
        VETERAN: 'Veteran'
        DISABLED: 'Developmental disabilities'
        SENIOR: 'Senior'
    fakeLoadingOverlayService =
      start: -> null
      stop: -> null
    sections = [
      { name: 'You', pages: [
          'name'
          'contact'
          'verify-address'
          'alternate-contact-type'
          'alternate-contact-name'
          'alternate-contact-phone-address'
        ]
      },
      { name: 'Household', pages: [
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
      { name: 'Income', pages: [
          'income-vouchers'
          'income'
        ]
      },
      { name: 'Preferences', pages: [
          'preferences-intro'
          'neighborhood-preference'
          'live-work-preference'
          'assisted-housing-preference'
          'preferences-programs'
          'general-lottery-notice'
        ]
      },
      { name: 'Review', pages: [
          'review-optional'
          'review-summary'
          'review-sign-in'
          'review-terms'
        ]
      }
    ]

    beforeEach module('ui.router')
    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$translate', $translate
      $provide.value '$auth', $auth
      $provide.value '$modal', $modal
      $provide.value 'Upload', Upload
      $provide.value 'uuid', uuid
      $provide.value 'bsLoadingOverlayService', fakeLoadingOverlayService
      $provide.value 'ShortFormApplicationService', fakeShortFormApplicationService
      return
    )

    beforeEach inject((_ShortFormNavigationService_, _$state_, _ShortFormApplicationService_) ->
      $state = _$state_
      ShortFormNavigationService = _ShortFormNavigationService_
      return
    )

    describe 'Service setup', ->
      it 'initializes defaults', ->
        expect(ShortFormNavigationService.sections).toEqual sections

    describe 'hasNav', ->
      it 'checks if section does not have nav enabled', ->
        $state.current.name = 'dahlia.short-form-welcome.intro'
        hasNav = ShortFormNavigationService.hasNav()
        expect(hasNav).toEqual false
      it 'checks if section has nav enabled', ->
        $state.current.name = 'dahlia.short-form-application.name'
        hasNav = ShortFormNavigationService.hasNav()
        expect(hasNav).toEqual true

    describe 'hasBackButton', ->
      it 'checks if section does not have back button enabled', ->
        $state.current.name = 'dahlia.short-form-welcome.intro'
        hasNav = ShortFormNavigationService.hasBackButton()
        expect(hasNav).toEqual false
      it 'checks if section has back button enabled', ->
        $state.current.name = 'dahlia.short-form-application.contact'
        hasNav = ShortFormNavigationService.hasBackButton()
        expect(hasNav).toEqual true

    describe 'activeSection', ->
      it 'gets the active section of the current page', ->
        $state.current.name = 'dahlia.short-form-application.preferences-programs'
        activeSection = ShortFormNavigationService.activeSection()
        expect(activeSection.name).toEqual 'Preferences'

    describe 'backPageState', ->
      it 'gets the previous page href to be used by the back button', ->
        $state.current.name = 'dahlia.short-form-application.contact'
        previousState = ShortFormNavigationService.backPageState()
        expect(previousState).toEqual $state.href('dahlia.short-form-application.name')

    describe 'previousPage', ->
      it 'gets the name of the previous page based on your current page', ->
        $state.current.name = 'dahlia.short-form-application.contact'
        previousPage = ShortFormNavigationService.previousPage()
        expect(previousPage).toEqual 'name'

    describe 'getNextReservedPageIfAvailable', ->
      it 'calls ShortFormApplicationService to check for the preference', ->
        type = 'Veteran'
        ShortFormNavigationService.getNextReservedPageIfAvailable(type)
        expect(fakeShortFormApplicationService.listingHasReservedUnitType).toHaveBeenCalledWith(type)
      it 'moves on to the priorities page if no reserved types found', ->
        type = 'Veteran'
        page = ShortFormNavigationService.getNextReservedPageIfAvailable(type)
        expect(page).toEqual 'household-priorities'

    describe 'getLandingPage', ->
      it 'gets the first page of the section if it\'s not Household', ->
        section = ShortFormNavigationService.sections[0]
        page = ShortFormNavigationService.getLandingPage(section)
        expect(page).toEqual section.pages[0]
      it 'gets household intro page if no householdMembers', ->
        householdSection = ShortFormNavigationService.sections[1]
        page = ShortFormNavigationService.getLandingPage(householdSection)
        expect(page).toEqual 'household-intro'
      it 'gets household members page if householdMembers', ->
        householdSection = ShortFormNavigationService.sections[1]
        fakeShortFormApplicationService.application.householdMembers = [{firstName: 'Joe'}]
        page = ShortFormNavigationService.getLandingPage(householdSection)
        expect(page).toEqual 'household-members'
      it 'gets income landing page', ->
        page = ShortFormNavigationService.getLandingPage({name: 'Income'})
        expect(page).toEqual 'income-vouchers'
      it 'gets preference landing page', ->
        page = ShortFormNavigationService.getLandingPage({name: 'Preferences'})
        expect(page).toEqual 'preferences-intro'
      it 'gets review survey if survey is incomplete', ->
        page = ShortFormNavigationService.getLandingPage({name: 'Review'})
        expect(page).toEqual 'review-optional'
      it 'gets review summary if survey is complete', ->
        fakeShortFormApplicationService.application.surveyComplete = true
        page = ShortFormNavigationService.getLandingPage({name: 'Review'})
        expect(page).toEqual 'review-summary'
