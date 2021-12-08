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
          when 'PO BOX'
              $translate.instant('error.address_validation_po_box')
          else
              $translate.instant('error.address_validation_not_found')

      @$onChanges = (changes) ->
        @setErrorMessage()

      return ctrl
  ]
