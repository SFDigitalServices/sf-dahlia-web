angular.module('dahlia.directives')
.directive 'raceEthnicityForm', ['ShortFormRaceEthnicityService', (ShortFormRaceEthnicityService) ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/race-ethnicity-form.html'

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user

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

      scope.user.raceEthnicity = checkedKeys.join(';')

      scope.topLevelOptionsChecked.clear()
      scope.topLevelOptionsChecked.add(ShortFormRaceEthnicityService.getTopLevelDemographicKey(key)) for key in checkedKeys

      # delete freetext from any unchecked demographics items
      for k, checked of scope.demographicsChecked when !checked
        freeTextKey = ShortFormRaceEthnicityService.getFreeTextKeyFromDemographicKey(k)
        if freeTextKey
          scope.user[freeTextKey] = ''

    scope.isFreeformTextDisabled = (parentOption, suboption) ->
      !scope.demographicsChecked[scope.getOptionKey(parentOption, suboption)]

    scope.removeSuboption = (parentOption, checkedSuboption) ->
      key = scope.getOptionKey(parentOption, checkedSuboption)
      scope.demographicsChecked[key] = false
      scope.onDemographicCheckedChanged()

    scope.clearAllRaceOptions = ->
      scope.demographicsChecked = {}
      scope.onDemographicCheckedChanged()

    scope.hasRaceOptionsSelected = -> Object.keys(scope.accumulatorOptions).length > 0

    scope.hasAtLeastOneSuboptionChecked = (option) ->
      scope.topLevelOptionsChecked.has(option.race_option[0])
]