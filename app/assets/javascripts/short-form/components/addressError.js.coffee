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
          when 'DUPLICATE UNIT'
            @errorMessage = $translate.instant('error.address_validation_duplicate_unit')
          else
            # Catch all other easy post validation errors and provide generic error response on how to get help. Most
            # often this is E.ADDRESS.NOT_FOUND, but could also be E.HOUSE_NUMBER.INVALID, E.STREET.MAGNET, etc, etc.
            # See https://www.easypost.com/errors-guide

            #address on the current form. it could be primary applicant or household member
            form = ShortFormApplicationService.form.applicationForm
            address1 = form.home_address_address1['$viewValue']
            address2 = form.home_address_address2['$viewValue']
            city = form.home_address_city['$viewValue']
            state = form.home_address_state['$viewValue']
            zip = form.home_address_zip['$viewValue']

            #applicant's phone number
            applicantPhone = ShortFormApplicationService.applicant.phone

            bodyParams =
              listing_name: ShortFormApplicationService.listing.Name
              home_address: address1 + (if address2 then ' ' + address2 else '') + ', ' + city + ', ' + state + ' ' + zip
              first_name: ShortFormApplicationService.applicant.firstName
              last_name: ShortFormApplicationService.applicant.lastName
              email: ShortFormApplicationService.applicant.email
              phone_number: if applicantPhone then '(' + applicantPhone[0..2] + ') ' + applicantPhone[3..-5] + '-' + applicantPhone[-4..] else ''

            #hard code something in english to the beginning of the email subject for email filtering
            mailParams =
              subject: '[Invalid Address Error] ' + $translate.instant('error.address_validation.not_found_subject')
              body: $translate.instant('error.address_validation.not_found_body', bodyParams)

            @errorMessageWithEmail = $translate.instant('error.address_validation.not_found'
              { mailInfo: "mailto:lotteryappeal@sfgov.org?#{SharedService.toQueryString(mailParams)}"})

      @$onChanges = () ->
        @setError()

      return ctrl
  ]
