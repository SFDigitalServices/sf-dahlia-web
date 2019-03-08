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
      @agents = []

      @$onInit = ->
        if @application.lendingAgent
          @selectedInstitution = _.findKey(@lendingInstitutions, (agents) ->
            _.some(agents, {'Id': ctrl.application.lendingAgent})
          )
          @agents = @lendingInstitutions[@selectedInstitution]

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
        @agents = @lendingInstitutions[@selectedInstitution]

      @showLendingAgents = ->
        !_.isEmpty(@agents)

      @agentName = (agent) ->
        "#{agent['FirstName']} #{agent['LastName']}"


      return ctrl
  ]
