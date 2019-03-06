angular.module('dahlia.components')
.component 'lendingInstitution',
  bindings:
    application: '<'
    form: '<'
  templateUrl: 'short-form/components/lending-institution.html'
  controller:
    ['ShortFormApplicationService', 'ShortFormHelperService', '$translate',
    (ShortFormApplicationService, ShortFormHelperService, $translate) ->
      ctrl = @
      @lendingInstitutions = ShortFormApplicationService.lendingInstitutions
      @selectedInstitution = ''
      @officers = []

      @$onInit = ->
        if @application.lendingAgent
          @selectedInstitution = _.findKey(@lendingInstitutions, (agents) ->
            _.some(agents, {'Id': ctrl.application.lendingAgent})
          )
          @officers = @lendingInstitutions[@selectedInstitution]

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
        @application.lendingAgent = null
        @officers = @lendingInstitutions[@selectedInstitution]

      @officesSelectActive = ->
        !_.isEmpty(@officers)

      @officerName = (officer) ->
        "#{officer['FirstName']} #{officer['LastName']}"


      return ctrl
  ]
