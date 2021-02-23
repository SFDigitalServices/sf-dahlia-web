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
    scope.updateAccumulatorOptions = () ->
      checkedKeys = (k for k, checked of scope.demographicsChecked when checked)
      scope.accumulatorOptions = ShortFormRaceEthnicityService.demographicsKeysToOptionsList(checkedKeys)

    # Set of checked top level options ex: { "Asian", "White" }
    scope.updateTopLevelOptionsChecked = () ->
      checkedKeys = (k for k, checked of scope.demographicsChecked when checked)
      scope.topLevelOptionsChecked = new Set(ShortFormRaceEthnicityService.getTopLevelDemographicKey(key) for key in checkedKeys)

    scope.updateAccumulatorOptions()
    scope.updateTopLevelOptionsChecked()

    scope.getRaceHeaderId = (option) -> "panel-#{option.key}"
    scope.getRaceCheckboxId = (option, suboption) -> "panel-#{option.key}-#{suboption.key}"
    scope.getRaceCheckboxLabelId = (option, suboption) -> "panel-label-#{option.key}-#{suboption.key}"
    scope.getRaceOtherTextInputId = (option, suboption) -> "#{scope.getRaceCheckboxId(option, suboption)}-text"

    scope.labelForHeader = ShortFormRaceEthnicityService.labelForHeader
    scope.labelForClearSelectedOption = ShortFormRaceEthnicityService.labelForClearSelectedOption
    scope.getOptionKey = ShortFormRaceEthnicityService.getOptionKey
    scope.getOtherFreeTextKey = ShortFormRaceEthnicityService.getOtherFreeTextKey
    scope.getTranslatedAccumulatorOption = (parentOption, checkedSuboption) ->
      freeTextString = scope.user[scope.getOtherFreeTextKey(checkedSuboption)]
      ShortFormRaceEthnicityService.getTranslatedAccumulatorOption(parentOption, checkedSuboption, freeTextString)

    # After the scope.demographicsChecked model changes, we need to change other models
    # that are calculated from it.
    scope.onDemographicCheckedChanged = ->
      scope.updateAccumulatorOptions()
      scope.updateTopLevelOptionsChecked()

      scope.user.raceEthnicity = ShortFormRaceEthnicityService.convertCheckboxValuesToUserField(scope.demographicsChecked)

      # delete freetext from any unchecked demographics items
      for k, checked of scope.demographicsChecked when !checked
        freeTextKey = ShortFormRaceEthnicityService.getFreeTextKeyFromDemographicKey(k)
        if freeTextKey
          # Delete by setting key to null to make sure we set it to empty on submit
          scope.user[freeTextKey] = null

    # Disable the freeform "Other" text input when the "Other" checkbox is unchecked
    scope.isFreeTextInputDisabled = (parentOption, suboption) ->
      !scope.demographicsChecked[scope.getOptionKey(parentOption, suboption)]

    # check or uncheck a suboption checkbox
    scope._updateSuboption = (parentOption, checkedSuboption, checked) ->
      key = scope.getOptionKey(parentOption, checkedSuboption)
      scope.demographicsChecked[key] = checked
      scope.onDemographicCheckedChanged()

    scope.onClearSingleRaceOptionClicked = (parentOption, checkedSuboption, event) ->
      scope._updateSuboption(parentOption, checkedSuboption, false)
      event.preventDefault() if event

    scope.onClearAllRaceOptionsClicked = (event) ->
      # Delete by setting to false to make sure we know to clear the freetext associated.
      scope.demographicsChecked[key] = false for key in Object.keys(scope.demographicsChecked)
      scope.onDemographicCheckedChanged()
      event.preventDefault() if event

    scope.hasAnyOptionsSelected = -> Object.keys(scope.accumulatorOptions).length > 0

    # Return true if the top level header (ex: "Asian") has any checked suboptions (Ex: "Chinese")
    scope.headerHasCheckedOption = (parentOption) ->
      scope.topLevelOptionsChecked.has(parentOption.key)

    # Collapse or expand a race/ethnicity section
    scope.toggleSelectedHeader = (parentOptionKey, event) ->
      isAlreadySelected = scope.selectedDemographicHeader == parentOptionKey
      scope.selectedDemographicHeader = if isAlreadySelected then null else parentOptionKey
      event.preventDefault() if event
]