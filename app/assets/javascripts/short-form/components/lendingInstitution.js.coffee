angular.module('dahlia.components')
.component 'lendingInstitution',
  bindings:
    applicant: '<'
    form: '<'
  templateUrl: 'short-form/components/lending-institution.html'
  controller:
    ['ShortFormApplicationService', 'ShortFormHelperService', '$translate',
    (ShortFormApplicationService, ShortFormHelperService, $translate) ->
      ctrl = @
      @lendingInstitutions = ShortFormApplicationService.lendingInstitutions
      @selectedInstitution = ''
      @officers = []

      @inputInvalid = (fieldName) ->
        form = @form.applicationForm
        return false unless form
        field = form[fieldName]
        if form && field
          field.$invalid && (field.$touched || form.$submitted)
        else
          false

      @lendingInstitutionsNames = ->
        _.keys(@lendingInstitutions)

      @onChangeLendingInstitution = ->
        @applicant.lendingAgent = null
        @officers = _.filter(@lendingInstitutions[@selectedInstitution], (officer) -> officer.Active)

      @officesSelectActive = ->
        !_.isEmpty(@officers)

      @officerName = (officer) ->
        "#{officer['First Name']} #{officer['Last Name']}"


      return ctrl
  ]
