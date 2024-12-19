do ->
  'use strict'
  describe 'ShortFormNavigationService', ->
    ShortFormNavigationService = undefined
    $translate = {}
    $auth = {}
    $state =
      current: {}
      go: jasmine.createSpy()
    Upload = {}
    uuid = {v4: jasmine.createSpy()}
    fakeAnalyticsService =
      trackFormSuccess: jasmine.createSpy()
    fakeShortFormApplicationService =
      application:
        householdMembers: []
      listingHasReservedUnitType: jasmine.createSpy()
      listingHasHomeAndCommunityBasedServicesUnits: jasmine.createSpy()
      RESERVED_TYPES:
        VETERAN: 'Veteran'
        DISABLED: 'Developmental disabilities'
        SENIOR: 'Senior'
    fakeLoadingOverlayService =
      start: -> null
      stop: -> null
    fakeModalService =
      modalInstance: {}
    fakeAccountService = {}
    fakeListingIdentityService =
      isRental: jasmine.createSpy()
      isSale: jasmine.createSpy()

    beforeEach module('ui.router')
    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$translate', $translate
      $provide.value '$auth', $auth
      $provide.value '$state', $state
      $provide.value 'Upload', Upload
      $provide.value 'uuid', uuid
      $provide.value 'AnalyticsService', fakeAnalyticsService
      $provide.value 'bsLoadingOverlayService', fakeLoadingOverlayService
      $provide.value 'ShortFormApplicationService', fakeShortFormApplicationService
      $provide.value 'AccountService', fakeAccountService
      $provide.value 'ModalService', fakeModalService
      $provide.value 'ListingIdentityService', fakeListingIdentityService
      return
    )

    beforeEach inject((_ShortFormNavigationService_) ->
      ShortFormNavigationService = _ShortFormNavigationService_
      return
    )

    describe 'goToApplicationPage', ->
      it 'calls AnalyticsService.trackFormSuccess with "Application"', ->
        ShortFormNavigationService.goToApplicationPage()
        expect(fakeAnalyticsService.trackFormSuccess).toHaveBeenCalledWith('Application Page View')

      describe 'when params are not provided', ->
        it 'calls $state.go with the given path', ->
          path = 'foo'
          ShortFormNavigationService.goToApplicationPage(path)
          expect($state.go).toHaveBeenCalledWith(path)

      describe 'when params are provided', ->
        it 'calls $state.go with the given path and params', ->
          path = 'foo'
          params = {bar: 'baz'}
          ShortFormNavigationService.goToApplicationPage(path, params)
          expect($state.go).toHaveBeenCalledWith(path, params)

    describe 'getStartOfSection', ->
      it 'gets the first page of the section if it\'s not Household', ->
        section = ShortFormNavigationService.sections()[0]
        page = ShortFormNavigationService.getStartOfSection(section)
        expect(page).toEqual section.pages[0]

      it 'gets household intro page if no householdMembers', ->
        householdSection = ShortFormNavigationService.sections()[2]
        fakeShortFormApplicationService.application.householdMembers = []
        page = ShortFormNavigationService.getStartOfSection(householdSection)
        expect(page).toEqual 'household-intro'

      it 'gets household members page if householdMembers', ->
        householdSection = ShortFormNavigationService.sections()[2]
        fakeShortFormApplicationService.application.householdMembers = [{firstName: 'Joe'}]
        page = ShortFormNavigationService.getStartOfSection(householdSection)
        expect(page).toEqual 'household-members'

      describe 'for a sale listing', ->
        it 'returns "income" as the start of the Income section', ->
          fakeListingIdentityService.isRental.and.returnValue(false)
          page = ShortFormNavigationService.getStartOfSection({name: 'Income'})
          expect(page).toEqual 'income'

      describe 'for a rental listing', ->
        it 'returns "income-vouchers" as the start of the Income section', ->
          fakeListingIdentityService.isRental.and.returnValue(true)
          page = ShortFormNavigationService.getStartOfSection({name: 'Income'})
          expect(page).toEqual 'income-vouchers'

      it 'gets preference landing page', ->
        page = ShortFormNavigationService.getStartOfSection({name: 'Preferences'})
        expect(page).toEqual 'preferences-intro'

      it 'goes to demographic survey review-optional as start of review', ->
        page = ShortFormNavigationService.getStartOfSection({name: 'Review'})
        expect(page).toEqual 'review-optional'

    describe 'goToSection', ->
      it 'calls Service.goToApplicationPage with the page path', ->
        page = 'household-intro'
        ShortFormNavigationService.getStartOfSection = jasmine.createSpy().and.returnValue(page)
        ShortFormNavigationService.goToApplicationPage = jasmine.createSpy()
        ShortFormNavigationService.goToSection('Household')
        expect(ShortFormNavigationService.goToApplicationPage)
          .toHaveBeenCalledWith("dahlia.short-form-application.#{page}")

    describe 'showHouseholdPrioritiesPage', ->
      it 'returns true for rental listings', ->
        listing = {id: 'foo'}
        fakeListingIdentityService.isRental.and.returnValue(true)
        expect(ShortFormNavigationService.showHouseholdPrioritiesPage(listing)).toEqual(true)

      it 'returns true for sale listings that are ACCESSIBLE_ONLY', ->
        listing = {id: 'foo', 'Reserved_community_type': 'Accessible Units Only'}
        fakeListingIdentityService.isRental.and.returnValue(false)
        expect(ShortFormNavigationService.showHouseholdPrioritiesPage(listing)).toEqual(true)

      it 'returns false for sale listings that are not ACCESSIBLE_ONLY', ->
        listing = {id: 'foo'}
        fakeListingIdentityService.isRental.and.returnValue(false)
        expect(ShortFormNavigationService.showHouseholdPrioritiesPage(listing)).toEqual(false)

    describe 'getPostReservedPage', ->
      describe 'when given a sale listing', ->
        it 'returns "income"', ->
          listing = {id: 'foo'}
          fakeListingIdentityService.isRental.and.returnValue(false)
          expect(ShortFormNavigationService.getPostReservedPage(listing)).toEqual('income')
        describe 'that is an accessible units only listing', ->
          it 'returns "household-priorities"', ->
            listing = {id: 'foo', 'Reserved_community_type': 'Accessible Units Only'}
            fakeListingIdentityService.isRental.and.returnValue(false)
            expect(ShortFormNavigationService.getPostReservedPage(listing)).toEqual('household-priorities')

      describe 'when given a rental listing', ->
        it 'returns "household-priorities"', ->
          listing = {id: 'foo'}
          fakeListingIdentityService.isRental.and.returnValue(true)
          expect(ShortFormNavigationService.getPostReservedPage(listing)).toEqual('household-priorities')

    describe 'getPostHouseholdPrioritiesPage', ->
      it 'returns income-vouchers for rentals', ->
          listing = {id: 'foo'}
          fakeListingIdentityService.isRental.and.returnValue(true)
          expect(ShortFormNavigationService.getPostHouseholdPrioritiesPage(listing)).toEqual('income-vouchers')
      it 'returns income if for non-rentals', ->
          listing = {id: 'foo'}
          fakeListingIdentityService.isRental.and.returnValue(false)
          expect(ShortFormNavigationService.getPostHouseholdPrioritiesPage(listing)).toEqual('income')

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
      it 'calls ListingIdentityService.isRental', ->
        $state.current.name = 'dahlia.short-form-welcome.intro'
        ShortFormNavigationService.hasBackButton()
        expect(fakeListingIdentityService.isRental).toHaveBeenCalled()
      it 'returns true for the Name page on a sale listing application', ->
        fakeListingIdentityService.isRental.and.returnValue(false)
        $state.current.name = 'dahlia.short-form-application.name'
        hasNav = ShortFormNavigationService.hasBackButton()
        expect(hasNav).toEqual true
      it 'returns false for the Name page on a rental listing application', ->
        fakeListingIdentityService.isRental.and.returnValue(true)
        $state.current.name = 'dahlia.short-form-application.name'
        hasNav = ShortFormNavigationService.hasBackButton()
        expect(hasNav).toEqual false

    describe 'activeSection', ->
      it 'gets the active section of the current page', ->
        $state.current.name = 'dahlia.short-form-application.preferences-programs'
        activeSection = ShortFormNavigationService.activeSection()
        expect(activeSection.name).toEqual 'Preferences'

    describe 'backPageState', ->
      it 'gets the previous page href to be used by the back button', ->
        $state.current.name = 'dahlia.short-form-application.contact'
        previousState = ShortFormNavigationService.backPageState()
        expect(previousState).toEqual 'dahlia.short-form-application.name'

    describe 'previousPage', ->
      it 'gets the name of the previous page based on your current page', ->
        $state.current.name = 'dahlia.short-form-application.contact'
        previousPage = ShortFormNavigationService.previousPage()
        expect(previousPage).toEqual 'name'

    describe 'getNextReservedPageIfAvailable', ->
      beforeEach ->
        ShortFormNavigationService.getPostReservedPage = jasmine.createSpy()

      it 'calls ShortFormApplicationService to check for the preference', ->
        type = 'Veteran'
        ShortFormNavigationService.getNextReservedPageIfAvailable(type)
        expect(fakeShortFormApplicationService.listingHasReservedUnitType).toHaveBeenCalledWith(type)
      it 'returns the result of ShortFormNavigationService.getPostReservedPage if no reserved types found', ->
        type = 'Veteran'
        ShortFormNavigationService.getPostReservedPage.and.returnValue('foo')
        page = ShortFormNavigationService.getNextReservedPageIfAvailable(type)
        expect(page).toEqual 'foo'

    describe 'redirectToListingIfNoApplication', ->
      beforeEach ->
        # reset the spy so that we can check for "not" toHaveBeenCalled
        $state.go = jasmine.createSpy()

      it "doesn't redirect if the application has a lottery number", ->
        fakeShortFormApplicationService.application.lotteryNumber = 12345678
        ShortFormNavigationService.redirectIfNoApplication()
        expect($state.go).not.toHaveBeenCalled()

      it 'redirects to the application start if there is a listing ID and no lottery number', ->
        fakeShortFormApplicationService.application.lotteryNumber = undefined
        listingId = 'abcdefghij'
        params = { id: listingId }
        fakeListing = { Id: listingId }

        ShortFormNavigationService.redirectIfNoApplication(fakeListing)
        expect($state.go).toHaveBeenCalledWith('dahlia.short-form-application.name', params)

    describe 'getPrevPageOfIncomePage', ->
      describe 'for a sale listing', ->
        it 'returns household-priorities if showHouseholdPrioritiesPage is true', ->
          fakeListingIdentityService.isRental.and.returnValue(false)
          ShortFormNavigationService.showHouseholdPrioritiesPage = jasmine.createSpy()
          ShortFormNavigationService.showHouseholdPrioritiesPage.and.returnValue(true)
          expect(ShortFormNavigationService.getPrevPageOfIncomePage()).toEqual('household-priorities')

        it 'calls Service.getNextReservedPageIfAvailable with Service.RESERVED_TYPES.DISABLED and "prev"', ->
          fakeListingIdentityService.isRental.and.returnValue(false)
          ShortFormNavigationService.getNextReservedPageIfAvailable = jasmine.createSpy()
          ShortFormNavigationService.getPrevPageOfIncomePage()
          expect(ShortFormNavigationService.getNextReservedPageIfAvailable)
            .toHaveBeenCalledWith(
              ShortFormNavigationService.RESERVED_TYPES.DISABLED,
              'prev'
            )

        it 'returns the result of calling Service.getNextReservedPageIfAvailable', ->
          fakeListingIdentityService.isRental.and.returnValue(false)
          path = 'foo'
          ShortFormNavigationService.getNextReservedPageIfAvailable = jasmine.createSpy()
          ShortFormNavigationService.getNextReservedPageIfAvailable.and.returnValue(path)
          expect(ShortFormNavigationService.getPrevPageOfIncomePage()).toEqual(path)

      describe 'for a rental listing', ->
        it 'returns "income-vouchers"', ->
          fakeListingIdentityService.isRental.and.returnValue(true)
          expect(ShortFormNavigationService.getPrevPageOfIncomePage()).toEqual('income-vouchers')

