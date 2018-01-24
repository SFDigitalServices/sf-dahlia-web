do ->
  'use strict'
  describe 'AutosaveService', ->

    AutosaveService = undefined
    fakeShortFormApplicationService =
      submitApplication: ->
    $interval = undefined

    beforeEach module('dahlia.services', ($provide) ->
      $provide.value 'ShortFormApplicationService', fakeShortFormApplicationService
      return
    )

    beforeEach inject((_$interval_, _AutosaveService_) ->
      $interval = _$interval_
      AutosaveService = _AutosaveService_
      return
    )

    describe 'Service.save', ->
      it 'calls submitApplication on ShortFormApplicationService', ->
        spyOn(fakeShortFormApplicationService, 'submitApplication')
        AutosaveService.save()
        expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalledWith({autosave: true})

    describe 'Service.startTimer', ->
      beforeEach ->
        AutosaveService.startTimer()

      it 'creates the autosave timer', ->
        expect(AutosaveService.timer).not.toEqual(null)
      it 'calls submitApplication after 1 minute', ->
        spyOn(fakeShortFormApplicationService, 'submitApplication')
        $interval.flush(1000) # move forward 1 second
        expect(fakeShortFormApplicationService.submitApplication).not.toHaveBeenCalled()
        $interval.flush(61000) # move forward 61 seconds
        expect(fakeShortFormApplicationService.submitApplication).toHaveBeenCalledWith({autosave: true})

    describe 'Service.stopTimer', ->
      beforeEach ->
        AutosaveService.startTimer()
        AutosaveService.stopTimer()

      it 'nullifies the autosave timer', ->
        expect(AutosaveService.timer).toEqual(null)
      it "doesn't call submitApplication after 1 minute", ->
        spyOn(fakeShortFormApplicationService, 'submitApplication')
        $interval.flush(61000) # move forward 61 seconds
        expect(fakeShortFormApplicationService.submitApplication).not.toHaveBeenCalled()
