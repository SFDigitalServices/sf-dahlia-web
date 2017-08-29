angular.module('dahlia.components')
.component 'addressError',
  bindings:
    error: '<'
  templateUrl: 'short-form/components/address-error.html'

  controller:
    ['$translate', ($translate) ->
      ctrl = @

      @setErrorMessage = =>
        unless @error
          @errorMessage = ''
          return
        @errorMessage = switch @error
          when 'Insufficient/incorrect address data'
            ,'Multiple response due to magnet street syndrome'
              $translate.instant('ERROR.ADDRESS_VALIDATION_INSUFFICIENT')
          when 'Missing secondary information(Apt/Suite#)'
              $translate.instant('ERROR.ADDRESS_VALIDATION_SECONDARY')
          else
              $translate.instant('ERROR.ADDRESS_VALIDATION_NOT_FOUND')

      @$onChanges = (changes) ->
        @setErrorMessage()

      return ctrl
  ]
