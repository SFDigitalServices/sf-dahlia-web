do ->
  'use strict'
  describe 'AccountService', ->
    AccountService = undefined
    $state = undefined
    $auth = undefined
    fakeState = 'dahlia.short-form-application.contact'
    fakeUserAuth = {email: 'a@b.c', password: '123123123'}

    beforeEach module('ui.router')
    beforeEach module('ng-token-auth')
    beforeEach module('dahlia.services', ($provide)->
      return
    )
    beforeEach inject((_AccountService_, _$state_, _$auth_, _$q_) ->
      $state = _$state_
      $state.go = jasmine.createSpy()
      $auth = _$auth_
      $q = _$q_
      spyOn($auth, 'submitRegistration').and.callFake ->
        deferred = $q.defer()
        deferred.resolve 'Remote call result'
        deferred.promise
      AccountService = _AccountService_
      return
    )

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


  return
