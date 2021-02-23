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
              $translate.instant('error.address_validation_insufficient')
          when 'Missing secondary information(Apt/Suite#)'
              $translate.instant('error.address_validation_secondary')
          else
              $translate.instant('error.address_validation_not_found')

      @$onChanges = (changes) ->
        @setErrorMessage()

      return ctrl
  ]
