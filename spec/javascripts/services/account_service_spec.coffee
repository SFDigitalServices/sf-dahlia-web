do ->
  'use strict'
  describe 'AccountService', ->
    AccountService = undefined
    ShortFormApplicationService = undefined
    $translate = {}
    $state = undefined
    $auth = undefined
    httpBackend = undefined
    requestURL = undefined
    fakeState = 'dahlia.short-form-application.contact'
    fakeUserAuth = {email: 'a@b.c', password: '123123123'}
    fakeShortFormApplicationService =
      applicant: {}
      importUserData: ->
    modalMock =
      open: () ->
        return
    fakeApplicant =
      firstName: 'Samantha'
      lastName: 'Bee'
    fakeApplicationsData =
      applications: [{listingID: '123'}]

    beforeEach module('ui.router')
    beforeEach module('ng-token-auth')
    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$translate', $translate
      $provide.value '$modal', modalMock
      $provide.value 'ShortFormApplicationService', fakeShortFormApplicationService
      return
    )

    beforeEach inject((_AccountService_, _$state_, _$auth_, _$q_, _$httpBackend_) ->
      $state = _$state_
      $state.go = jasmine.createSpy()
      $auth = _$auth_
      $q = _$q_
      httpBackend = _$httpBackend_
      fakeHttp =
        success: (callback) ->
          callback({})
          { error: -> return }
        then: (callback) ->
          callback({})
          { catch: -> return }
        error: (callback) -> callback({})
      spyOn($auth, 'submitRegistration').and.callFake -> fakeHttp
      spyOn($auth, 'submitLogin').and.callFake -> fakeHttp
      spyOn($auth, 'validateUser').and.callFake -> fakeHttp
      AccountService = _AccountService_
      requestURL = AccountService.requestURL
      return
    )

    describe 'rememberShortFormState', ->
      it 'saves rememberedShortFormState', ->
        AccountService.rememberShortFormState(fakeState)
        expect(AccountService.rememberedShortFormState).toEqual fakeState
        return
      return

    describe 'Service setup', ->
      it 'initializes lockedFields defaults', ->
        expectedDefault =
          name: false
          dob: false
          email: false
        expect(AccountService.lockedFields).toEqual expectedDefault
        return
      return

    describe 'createAccount', ->
      it 'calls $auth.submitRegistration with userAuth params', ->
        AccountService.userAuth = fakeUserAuth
        AccountService.createAccount()
        expect($auth.submitRegistration).toHaveBeenCalledWith fakeUserAuth
        return
      return

    describe 'signIn', ->
      it 'calls $auth.submitLogin with userAuth params', ->
        AccountService.userAuth = fakeUserAuth
        AccountService.signIn()
        expect($auth.submitLogin).toHaveBeenCalledWith fakeUserAuth
        return
      return

    describe 'validateUser', ->
      it 'calls $auth.validateUser', ->
        AccountService.validateUser()
        expect($auth.validateUser).toHaveBeenCalled()
        return
      return

    describe 'openConfirmEmailModal', ->
      describe 'account just created', ->
        it 'called modal to open', ->
          spyOn(modalMock, 'open')
          modalArgument =
            templateUrl: 'account/templates/partials/_confirm_email_modal.html',
            controller: 'ModalInstanceController',
            windowClass: 'modal-large'
          AccountService.createdAccount.email = 'some@email.com'
          AccountService.createdAccount.confirmed_at = undefined
          AccountService.openConfirmEmailModal()
          expect(modalMock.open).toHaveBeenCalledWith(modalArgument)
          return
        return

    describe 'openConfirmationExpiredModal', ->
      describe 'confirmation link expired', ->
        it 'called modal to open', ->
          spyOn(modalMock, 'open')
          modalArgument =
            templateUrl: 'account/templates/partials/_confirmation_expired_modal.html',
            controller: 'ModalInstanceController',
            windowClass: 'modal-large'
          AccountService.createdAccount.email = 'some@email.com'
          AccountService.openConfirmationExpiredModal()
          expect(modalMock.open).toHaveBeenCalledWith(modalArgument)
          return
        return

    describe 'lockCompletedFields', ->
      it 'checks for lockedFields', ->
        fakeShortFormApplicationService.applicant = fakeApplicant
        AccountService.lockCompletedFields()
        expect(AccountService.lockedFields.name).toEqual true
        return

      it 'checks for unlockedFields', ->
        fakeShortFormApplicationService.applicant = fakeApplicant
        AccountService.lockCompletedFields()
        expect(AccountService.lockedFields.dob).toEqual false
        return
      return


    describe 'getMyApplications', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
        return
      it 'assigns Service.myApplications with user\'s applications', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeApplicationsData
        AccountService.getMyApplications()
        httpBackend.flush()
        expect(AccountService.myApplications).toEqual fakeApplicationsData.applications



  return
