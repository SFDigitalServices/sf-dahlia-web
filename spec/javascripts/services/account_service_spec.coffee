do ->
  'use strict'
  describe 'AccountService', ->
    AccountService = undefined
    ShortFormApplicationService = undefined
    $translate = {}
    Upload = {}
    uuid = {v4: jasmine.createSpy()}
    $state = undefined
    $auth = undefined
    fakeState = 'dahlia.short-form-application.contact'
    fakeUserAuth = {email: 'a@b.c', password: '123123123'}
    fakeApplicant =
      firstName: 'Samantha'
      lastName: 'Bee'

    beforeEach module('ui.router')
    beforeEach module('ng-token-auth')
    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$translate', $translate
      $provide.value 'Upload', Upload
      $provide.value 'uuid', uuid
      return
    )
    beforeEach inject((_AccountService_, _ShortFormApplicationService_, _$state_, _$auth_, _$q_) ->
      $state = _$state_
      $state.go = jasmine.createSpy()
      $auth = _$auth_
      $q = _$q_
      spyOn($auth, 'submitRegistration').and.callFake ->
        deferred = $q.defer()
        deferred.resolve 'Remote call result'
        deferred.promise
      spyOn($auth, 'submitLogin').and.callFake ->
        deferred = $q.defer()
        deferred.resolve 'Remote call result'
        deferred.promise
      spyOn($auth, 'validateUser').and.callFake ->
        deferred = $q.defer()
        deferred.resolve 'Remote call result'
        deferred.promise
      AccountService = _AccountService_
      ShortFormApplicationService = _ShortFormApplicationService_
      ShortFormApplicationService.applicant = {}
      return
    )

    describe 'Service setup', ->
      it 'initializes lockedFields defaults', ->
        expectedDefault =
          name: false
          dob: false
          email: false
        expect(AccountService.lockedFields).toEqual expectedDefault
        return
      return

    describe 'rememberState', ->
      it 'saves rememberedState', ->
        AccountService.rememberState(fakeState)
        expect(AccountService.rememberedState).toEqual fakeState
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

    describe 'lockCompletedFields', ->
      it 'checks for lockedFields', ->
        ShortFormApplicationService.applicant = fakeApplicant
        AccountService.lockCompletedFields()
        expect(AccountService.lockedFields.name).toEqual true
        return

      it 'checks for unlockedFields', ->
        ShortFormApplicationService.applicant = fakeApplicant
        AccountService.lockCompletedFields()
        expect(AccountService.lockedFields.dob).toEqual false
        return
      return

  return
