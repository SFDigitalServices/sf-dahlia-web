angular.module('dahlia.directives')
.directive 'raceEthnicityForm', ['ShortFormRaceEthnicityService', (ShortFormRaceEthnicityService) ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/race-ethnicity-form.html'

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user

    # The model that checked options are assigned to
    # Ex: { "White - European": true, "White - Other": false }
    scope.demographicsChecked = ShortFormRaceEthnicityService.convertUserFieldToCheckboxValues(scope.user.raceEthnicity)

    # Converted checked options for the accumulator
    # Ex: [{ parent_option: <top level option object>, checked_suboption: ["suboption_key", "suboption_translation_string"]}]
    scope.accumulatorOptions = {}

    # Set of checked top level options ex: { "Asian", "White" }
    scope.topLevelOptionsChecked = new Set()

    scope.getOptionKey = ShortFormRaceEthnicityService.getOptionKey
    scope.getOtherFreeTextKey = ShortFormRaceEthnicityService.getOtherFreeTextKey
    scope.getTranslatedAccumulatorOption = (parentOption, checkedSuboption) ->
      freeformText = scope.user[scope.getOtherFreeTextKey(checkedSuboption)]
      ShortFormRaceEthnicityService.getTranslatedAccumulatorOption(freeformText, parentOption, checkedSuboption)

    scope.onDemographicCheckedChanged = ->
      checkedKeys = (k for k, checked of scope.demographicsChecked when checked)
      scope.accumulatorOptions = (ShortFormRaceEthnicityService.demographicsKeyToOptions(k) for k in checkedKeys)

      scope.user.raceEthnicity = ShortFormRaceEthnicityService.convertCheckboxValuesToUserField(scope.demographicsChecked)

      scope.topLevelOptionsChecked.clear()
      scope.topLevelOptionsChecked.add(ShortFormRaceEthnicityService.getTopLevelDemographicKey(key)) for key in checkedKeys

      # delete freetext from any unchecked demographics items
      for k, checked of scope.demographicsChecked when !checked
        freeTextKey = ShortFormRaceEthnicityService.getFreeTextKeyFromDemographicKey(k)
        if freeTextKey
          # Delete by setting key to null to make sure we set it to empty on submit
          scope.user[freeTextKey] = null

    scope.isFreeformTextDisabled = (parentOption, suboption) ->
      !scope.demographicsChecked[scope.getOptionKey(parentOption, suboption)]

    scope.removeSuboption = (parentOption, checkedSuboption) ->
      key = scope.getOptionKey(parentOption, checkedSuboption)
      # Delete by setting to false to make sure we know to clear the freetext associated.
      scope.demographicsChecked[key] = false
      scope.onDemographicCheckedChanged()

    scope.clearAllRaceOptions = ->
      console.log "CLEARING OPTIONS"
      # Delete by setting to false to make sure we know to clear the freetext associated.

      scope.demographicsChecked[key] = false for key in Object.keys(scope.demographicsChecked)
      scope.onDemographicCheckedChanged()

    scope.hasRaceOptionsSelected = -> Object.keys(scope.accumulatorOptions).length > 0

    scope.hasAtLeastOneSuboptionChecked = (option) ->
      scope.topLevelOptionsChecked.has(option.race_option[0])

    scope.onDemographicHeaderSelect = (selectedOption) ->
      if scope.selectedDemographicHeader == selectedOption
        scope.selectedDemographicHeader = null
      else
        scope.selectedDemographicHeader = selectedOption

    scope.onDemographicCheckedChanged()
]