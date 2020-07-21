KEYCODE_SPACE = 32
KEYCODE_ENTER = 13

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

    scope.getRaceHeaderId = (option) -> "panel-#{option.key}"
    scope.getRaceCheckboxId = (option, suboption) -> "panel-#{option.key}-#{suboption.key}"
    scope.getRaceOtherTextInputId = (option, suboption) -> "#{scope.getRaceCheckboxId(option, suboption)}-text"

    scope.updateAccumulatorOptions()
    scope.updateTopLevelOptionsChecked()

    scope.getOptionKey = ShortFormRaceEthnicityService.getOptionKey
    scope.getOtherFreeTextKey = ShortFormRaceEthnicityService.getOtherFreeTextKey
    scope.getTranslatedAccumulatorOption = (parentOption, checkedSuboption) ->
      freeTextString = scope.user[scope.getOtherFreeTextKey(checkedSuboption)]
      ShortFormRaceEthnicityService.getTranslatedAccumulatorOption(parentOption, checkedSuboption, freeTextString)

    # Return true if the event is a keyboard event other than space or enter
    scope._isKeyboardSelectEvent = (e) ->
      if !event || e.type != 'keypress'
        return false
      keyCode = if e.keyCode then e.keyCode else e.which;
      keyCode == KEYCODE_SPACE || keyCode == KEYCODE_ENTER

    # Only call func if the event is 1) undefined or 2) a click or space/enter keypress event
    # We have to manually check this because angular doesn't handle keyboard selection for links
    # very well.
    scope._triggerOnClickOrKeypress = (event, func) ->
      isKeyboardEvent = event && event instanceof KeyboardEvent

      if isKeyboardEvent
        if !scope._isKeyboardSelectEvent(event)
          return

        # ng-keypress doesn't override key press event like it should
        event.preventDefault();
      func()

    scope.onDemographicCheckedChanged = (event) ->
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

    scope._updateSuboption = (parentOption, checkedSuboption, value) ->
      key = scope.getOptionKey(parentOption, checkedSuboption)
      scope.demographicsChecked[key] = value
      scope.onDemographicCheckedChanged()

    scope.uncheckSuboption = (parentOption, checkedSuboption, event) ->
      scope._triggerOnClickOrKeypress(event, () -> scope._updateSuboption(parentOption, checkedSuboption, false))

    scope.uncheckAllRaceOptions = (event) ->
      uncheckAllFunc = ->
        # Delete by setting to false to make sure we know to clear the freetext associated.
        scope.demographicsChecked[key] = false for key in Object.keys(scope.demographicsChecked)
        scope.onDemographicCheckedChanged()
      scope._triggerOnClickOrKeypress(event, uncheckAllFunc)

    scope.hasAnyOptionsSelected = -> Object.keys(scope.accumulatorOptions).length > 0

    # Return true if the top level header (ex: "Asian") has any checked suboptions (Ex: "Chinese")
    scope.headerHasCheckedOption = (parentOption) ->
      scope.topLevelOptionsChecked.has(parentOption.key)

    scope.toggleSelectedHeader = (parentOptionKey, event) ->
      toggleSelectedHeaderFunc = ->
        isAlreadySelected = scope.selectedDemographicHeader == parentOptionKey
        scope.selectedDemographicHeader = if isAlreadySelected then null else parentOptionKey
      scope._triggerOnClickOrKeypress(event, toggleSelectedHeaderFunc)
]