angular.module('dahlia.components')
.component 'addressError',
  bindings:
    error: '<'
  templateUrl: 'short-form/components/address-error.html'

  controller:
    ['SharedService', '$translate', 'ShortFormApplicationService', (SharedService, $translate, ShortFormApplicationService) ->
      ctrl = @

      @setError = =>
        unless @error
          @errorMessage = ''
          @errorMessageWithEmail = ''
          return

        switch @error
          when 'PO BOX'
            @errorMessage = $translate.instant('error.address_validation_po_box')
          else
            # Catch all other easy post validation errors and provide generic error response on how to get help. Most
            # often this is E.ADDRESS.NOT_FOUND, but could also be E.HOUSE_NUMBER.INVALID, E.STREET.MAGNET, etc, etc.
            # See https://www.easypost.com/errors-guide
            homeAddress = ShortFormApplicationService.applicant.home_address
            phone = ShortFormApplicationService.applicant.phone
            bodyParams =
              listing_name: ShortFormApplicationService.listing.Name
              applicant_address: homeAddress.address1 + (if homeAddress.address2 then ' ' + homeAddress.address2 else '') +
                ', ' + homeAddress.city + ', ' + homeAddress.state + ' ' + homeAddress.zip
              applicant_first_name: ShortFormApplicationService.applicant.firstName
              applicant_last_name: ShortFormApplicationService.applicant.lastName
              applicant_email: ShortFormApplicationService.applicant.email
              applicant_phone_number: if phone then '(' + phone[0..2] + ') ' + phone[3..-5] + '-' + phone[-4..] else ''

            mailParams =
              subject: $translate.instant('error.address_validation.not_found_subject')
              body: $translate.instant('error.address_validation.not_found_body', bodyParams)

            @errorMessageWithEmail = $translate.instant('error.address_validation.not_found'
              { mailInfo: "mailto:lotteryappeals@sfgov.org?#{SharedService.toQueryString(mailParams)}"})

      @$onChanges = () ->
        @setError()

      return ctrl
  ]
