angular.module('dahlia.components')
.component 'lendingInstitution',
  bindings:
    application: '<'
    form: '<'
  templateUrl: 'short-form/components/lending-institution.html'
  controller:
    ['ShortFormApplicationService', (ShortFormApplicationService) ->
      ctrl = @
      @lendingInstitutions = ShortFormApplicationService.lendingInstitutions
      @lotteryDate = moment(ShortFormApplicationService.listing.Lottery_Date)
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

      @agentIsInactive = (id) ->
        return unless id
        selectedAgent = _.find(@agents, { Id: id })
        selectedAgent.Status == 'Inactive'

      @agentInactiveDate = (id) ->
        return unless id
        selectedAgent = _.find(@agents, { Id: id })
        selectedAgent.Lending_Agent_Inactive_Date

      @lendingInstitutionsNames = ->
        _.keys(@lendingInstitutions)

      @onChangeLendingInstitution = ->
        @application.lendingAgent = null
        @agents = _.filter(@lendingInstitutions[@selectedInstitution], (agent) ->
          agent.Status != 'Removed'
        )

      @showLendingAgents = ->
        !_.isEmpty(@agents)

      @agentName = (agent) ->
        "#{agent['FirstName']} #{agent['LastName']}"


      return ctrl
  ]
