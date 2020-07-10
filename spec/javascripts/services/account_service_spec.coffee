do ->
  'use strict'
  describe 'AccountService', ->
    AccountService = undefined
    ShortFormApplicationService = undefined
    $translate =
      use: jasmine.createSpy('$translate.use').and.returnValue('currentLocale')
      instant: ->
    $state = undefined
    $auth = undefined
    httpBackend = undefined
    requestURL = undefined
    fakeParams = undefined
    fakeState = 'dahlia.short-form-application.contact'
    fakeLoadingOverlayService =
      start: jasmine.createSpy()
      stop: jasmine.createSpy()
    fakeShortForm = getJSONFixture('sample-web-short-form.json')
    fakeShortFormDataService =
      formatApplication: -> fakeShortForm
      reformatApplication: -> fakeShortForm
      formatUserDOB: jasmine.createSpy().and.returnValue('fakeDOB')
      removeDOBFields: jasmine.createSpy().and.returnValue('contactWithoutDOBs')
    fakeModalService =
      openModal: jasmine.createSpy()
      closeModal: jasmine.createSpy()
    fakeAuthResponse =
      id: 99
      email: 'applicant@email.com'
      salesforce_contact_id: '001f000000r000000'
    fakeUpdateResponse =
      contact:
        DOB: '1999-04-04'
        firstName: 'X'
        lastName: 'Y'
    fakeUserAuth =
      user:
        email: 'a@b.c'
        password: '123123123'
      contact:
        dob_day: 1
        dob_month: 13
        dob_year: 1920
        firstName: 'Bob'
        middleName: 'Paul'
        lastName: 'Jones'
    fakeShortFormApplicationService =
      applicant: {}
      importUserData: ->
      resetApplicationData: jasmine.createSpy()
    fakeApplicant =
      firstName: 'Samantha'
      lastName: 'Bee'
    fakeApplicantFull =
      firstName: 'Samantha'
      middlename: 'X.'
      lastName: 'Bee'
      dob_day: '1'
      dob_month: '12'
      dob_year: '1970'
      email: 'contact@info.com'
    fakeApplicationsData =
      applications: [fakeShortForm]

    beforeEach module('ui.router')
    beforeEach module('ng-token-auth')
    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$translate', $translate
      $provide.value 'bsLoadingOverlayService', fakeLoadingOverlayService
      $provide.value 'ShortFormApplicationService', fakeShortFormApplicationService
      $provide.value 'ShortFormDataService', fakeShortFormDataService
      $provide.value 'ModalService', fakeModalService
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
      spyOn($auth, 'signOut').and.callFake -> fakeHttp
      spyOn($auth, 'submitLogin').and.callFake -> fakeHttp
      spyOn($auth, 'validateUser').and.callFake -> fakeHttp
      spyOn($auth, 'requestPasswordReset').and.callFake -> fakeHttp
      spyOn($auth, 'updatePassword').and.callFake -> fakeHttp
      AccountService = _AccountService_
      requestURL = AccountService.requestURL
      return
    )

    describe 'rememberShortFormState', ->
      it 'saves rememberedShortFormState', ->
        AccountService.rememberShortFormState(fakeState)
        expect(AccountService.rememberedShortFormState).toEqual fakeState

    describe 'Service setup', ->
      it 'initializes lockedFields defaults', ->
        expectedDefault =
          name: false
          dob: false
          email: false
        expect(AccountService.lockedFields).toEqual expectedDefault

    describe 'loggedIn', ->
      it 'returns value of Service.loggedInUser.signedIn', ->
        AccountService.loggedInUser.signedIn = true
        expect(AccountService.loggedIn()).toEqual true

    describe 'createAccount', ->
      beforeEach ->
        AccountService.userAuth = angular.copy(fakeUserAuth)
        fakeParams = AccountService.createAccountParams()

      it 'calls $auth.submitRegistration with userAuth params', ->
        AccountService.createAccount()
        expect($auth.submitRegistration).toHaveBeenCalledWith fakeParams
      it 'adds temp_session_id if shortFormSession is present', ->
        fakeSession = {uid: 'xyz'}
        AccountService.createAccount(fakeSession)
        fakeParams.user.temp_session_id = fakeSession.uid
        expect($auth.submitRegistration).toHaveBeenCalledWith fakeParams
      it 'triggers loading overlay', ->
        AccountService.createAccount()
        expect(fakeLoadingOverlayService.start).toHaveBeenCalled()
    describe 'createAccountParams', ->
      it 'returns expectedParams', ->
        AccountService.userAuth = angular.copy(fakeUserAuth)
        expectedParams =
          user:
            email: 'a@b.c'
            password: '123123123'
          contact: 'contactWithoutDOBs'
          locale: 'currentLocale'
        expect(AccountService.createAccountParams()).toEqual expectedParams

    describe 'signIn', ->
      it 'calls $auth.submitLogin with userAuth params', ->
        AccountService.userAuth = angular.copy(fakeUserAuth)
        AccountService.signIn()
        expect($auth.submitLogin).toHaveBeenCalledWith fakeUserAuth.user

      it 'triggers loading overlay', ->
        AccountService.userAuth = angular.copy(fakeUserAuth)
        AccountService.signIn()
        expect(fakeLoadingOverlayService.start).toHaveBeenCalled()

    describe 'signOut', ->
      it 'calls $auth.signOut', ->
        AccountService.signOut()
        expect($auth.signOut).toHaveBeenCalled()

      it 'resets user data', ->
        AccountService.signOut()
        expect(fakeShortFormApplicationService.resetApplicationData).toHaveBeenCalled()
        expect(AccountService.loggedInUser).toEqual {}

    describe 'validateUser', ->
      it 'calls $auth.validateUser', ->
        AccountService.validateUser()
        expect($auth.validateUser).toHaveBeenCalled()

    describe 'requestPasswordReset', ->
      it 'calls $auth.requestPasswordReset', ->
        AccountService.userAuth =
          user: { email: 'example@email.com' }
        expectedParams = { email: 'example@email.com', locale: 'currentLocale' }
        AccountService.requestPasswordReset()
        expect($auth.requestPasswordReset).toHaveBeenCalledWith(expectedParams)

    describe 'updatePassword', ->
      it 'calls $auth.updatePassword', ->
        AccountService.userAuth =
          user:
            password: 'password'
            password_confirmation: 'password'
        expectedParams =
          password: 'password'
          password_confirmation: 'password'
          locale: 'currentLocale'
        AccountService.updatePassword()
        expect($auth.updatePassword).toHaveBeenCalledWith(expectedParams)

    describe 'resendConfirmationEmail', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'sends a post request to the confirmation endpoint', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeAuthResponse
        AccountService.createdAccount.email = 'testEmail'
        expectedParams =
          locale: 'currentLocale'
          email: 'testEmail'
        httpBackend.expectPOST('/api/v1/auth/confirmation', expectedParams)
        AccountService.resendConfirmationEmail()
        expect(httpBackend.flush).not.toThrow()

    describe 'updateAccount', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()

      it 'assigns an email success message', ->
        AccountService.userAuth =
          user:
            email: 'newemail@new1.com'

        expectedParams =
          locale: 'currentLocale'
          user:
            email: 'newemail@new1.com'
        httpBackend.expectPUT('/api/v1/auth', expectedParams)
        stubAngularAjaxRequest httpBackend, requestURL, fakeAuthResponse
        AccountService.updateAccount('email')
        httpBackend.flush()
        expect(AccountService.accountSuccess.messages.email).not.toEqual null

      it 'assigns new name/DOB attributes after update', ->
        AccountService.userAuth = angular.copy(fakeUserAuth)
        stubAngularAjaxRequest httpBackend, requestURL, fakeUpdateResponse
        spyOn(AccountService, 'userDataForSalesforce').and.returnValue('fakeContact')

        expectedParams =
          locale: 'currentLocale'
          contact: 'fakeContact'

        httpBackend.expectPUT('/api/v1/account/update', expectedParams)
        AccountService.updateAccount('nameDOB')
        httpBackend.flush()
        expect(AccountService.loggedInUser.firstName).toEqual fakeUpdateResponse.contact.firstName

    describe 'openConfirmEmailModal', ->
      describe 'account just created', ->
        it 'calls ModalService.openModal with the confirm email template', ->
          templateUrl = 'account/templates/partials/_confirm_email_modal.html'
          AccountService.openConfirmEmailModal()
          expect(fakeModalService.openModal).toHaveBeenCalledWith(templateUrl)

      describe 'unconfirmed user tries to log in', ->
        it 'sets the createdAccount.email to the given email', ->
          email = 'some@email.com'
          AccountService.openConfirmEmailModal(email)
          expect(AccountService.createdAccount.email).toEqual(email)

    describe 'openConfirmationExpiredModal', ->
      describe 'confirmation link expired', ->
        it 'calls ModalService.openModal with the confirmation expired template', ->
          templateUrl = 'account/templates/partials/_confirmation_expired_modal.html'
          AccountService.openConfirmationExpiredModal()
          expect(fakeModalService.openModal).toHaveBeenCalledWith(templateUrl)

    describe 'userDataForSalesforce', ->
      it 'calls ShortFormDataService to format DOB', ->
        AccountService.userAuth = angular.copy(fakeUserAuth)
        contact = AccountService.userDataForSalesforce()

        expectedContact =
          dob_day: 1
          dob_month: 13
          dob_year: 1920
          firstName: 'Bob'
          middleName: 'Paul'
          lastName: 'Jones'
          email: 'a@b.c'

        expect(contact).toEqual 'contactWithoutDOBs'
        expect(fakeShortFormDataService.formatUserDOB).toHaveBeenCalledWith expectedContact
        expectedContact.DOB = 'fakeDOB'
        expect(fakeShortFormDataService.removeDOBFields).toHaveBeenCalledWith expectedContact


    describe 'lockCompletedFields', ->
      it 'checks for lockedFields', ->
        fakeShortFormApplicationService.applicant = fakeApplicant
        AccountService.lockCompletedFields()
        expect(AccountService.lockedFields.name).toEqual true

      it 'checks for unlockedFields', ->
        fakeShortFormApplicationService.applicant = fakeApplicant
        AccountService.lockCompletedFields()
        expect(AccountService.lockedFields.dob).toEqual false

    describe 'copyApplicantFields', ->
      beforeEach ->
        fakeShortFormApplicationService.applicant = fakeApplicantFull

      it 'copies fields from ShortFormApplicationService into userAuth.contact', ->
        AccountService.copyApplicantFields()
        info = _.pick fakeApplicantFull,
          ['firstName', 'middleName', 'lastName', 'dob_day', 'dob_month', 'dob_year']
        expect(AccountService.userAuth.contact).toEqual info
      it 'copies fields from ShortFormApplicationService into userAuth.user', ->
        AccountService.copyApplicantFields()
        info = _.pick fakeApplicantFull, ['email']
        expect(AccountService.userAuth.user).toEqual info
      it 'should exclude email when specified', ->
        AccountService.copyApplicantFields('primary', { excludeEmail: true })
        expect(AccountService.userAuth.user.email).toBeUndefined()

    describe 'getMyApplications', ->
      afterEach ->
        httpBackend.verifyNoOutstandingExpectation()
        httpBackend.verifyNoOutstandingRequest()
      it 'assigns Service.myApplications with user\'s applications', ->
        stubAngularAjaxRequest httpBackend, requestURL, fakeApplicationsData
        AccountService.getMyApplications()
        httpBackend.flush()
        expect(AccountService.myApplications).toEqual fakeApplicationsData.applications

    describe 'afterLoginRedirect', ->
      it 'assigns loginRedirect with path', ->
        path = 'dahlia.account-settings'
        AccountService.afterLoginRedirect(path)
        expect(AccountService.loginRedirect).toEqual path

    describe 'goToLoginRedirect', ->
      it 'takes you to redirect path', ->
        path = 'dahlia.account-settings'
        AccountService.afterLoginRedirect(path)
        AccountService.goToLoginRedirect()
        expect($state.go).toHaveBeenCalledWith(path)

    describe 'clearAccountMessages', ->
      it 'clears the messages', ->
        AccountService.accountError.messages = {test: 'xyz'}
        AccountService.accountSuccess.messages = {test: 'xyz'}
        AccountService.clearAccountMessages()
        expect(AccountService.accountError.messages).toEqual {}
        expect(AccountService.accountSuccess.messages).toEqual {}
