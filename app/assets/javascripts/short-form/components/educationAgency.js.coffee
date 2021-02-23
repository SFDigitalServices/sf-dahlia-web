angular.module('dahlia.components')
.component 'educationAgency',
  bindings:
    application: '<'
    form: '<'
  templateUrl: 'short-form/components/education-agency.html'
  controller:
    ['ShortFormApplicationService', (ShortFormApplicationService) ->
      ctrl = @
      @agencies = ['ASIAN Inc.', 'BALANCE', 'Mission Economic Development Agency',
      'San Francisco Housing Development Corporation', 'San Francisco LGBT Community Center']

      @inputInvalid = (fieldName) ->
        form = @form.applicationForm
        return false unless form
        field = form[fieldName]
        if form && field
          field.$invalid && (field.$touched || form.$submitted)
        else
          false

      return ctrl
  ]
