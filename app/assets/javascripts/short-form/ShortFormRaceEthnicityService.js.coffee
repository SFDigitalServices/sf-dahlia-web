ShortFormRaceEthnicityService = ($translate, ShortFormHelperService) ->
  Service = {}

  t = (translationKey) -> $translate.instant(translationKey)

  Service.DEMOGRAPHICS_KEY_DELIMITER = ' - '
  Service.APPLICANT_RACE_ETHNICITY_DELIMITER = ';'

  # Given an option, format it as a translated string to display in the accumulator.
  Service.getTranslatedAccumulatorOption = (parentOption, checkedSuboption, freeTextString) ->
    baseText = "#{t(parentOption.race_option[1])}: #{t(checkedSuboption.checkbox_option[1])}"
    if freeTextString then "#{baseText} (#{freeTextString})" else baseText

  # Given parent and suboption objects, return the demographic option key (ex: "Asian - Chinese")
  Service.getOptionKey = (parentOption, checkedSuboption) ->
    parentOption.race_option[0] + Service.DEMOGRAPHICS_KEY_DELIMITER + checkedSuboption.checkbox_option[0]

  # Given a suboption, get the associated field name for the free text on that option (ex: <asian-other-suboption-object> -> "asianOther")
  # Note if you pass a demographic key without a free text option, this will return an empty string (ex: <asian-chinese-suboption-object> -> '')
  Service.getOtherFreeTextKey = (checkedSuboption) ->
    if checkedSuboption.text_option then checkedSuboption.text_option[0] else ''

  # Given a demographic key, get the associated field name for the free text on that option (ex: "Asian - Other" -> "asianOther")
  # Note if you pass a demographic key without a free text option, this will return an empty string (ex: "Asian - Chinese" -> '')
  Service.getFreeTextKeyFromDemographicKey = (demographicKey) ->
    options = Service.demographicsKeyToOptions(demographicKey)
    Service.getOtherFreeTextKey(options.checked_suboption)

  # Get the first item in an array that matches the predicate
  Service.findFirst = (arr, predicate) -> (i for i in arr when predicate(i))[0]

  # Get the parent demographic option object given the parent option key (ex: "Asian").
  Service.getTopLevelDemographicOption = (parentOptionKey) ->
    Service.findFirst(ShortFormHelperService.race_and_ethnicity_options, (o) -> o.race_option[0] is parentOptionKey)

  # Given a top level option, find the child option that matches the suboptionKey.
  Service.getDemographicSuboption = (parentOption, suboptionKey) ->
    Service.findFirst(parentOption.race_suboptions, (suboption) -> suboption.checkbox_option[0] is suboptionKey)


  # "Asian - Chinese" -> { parent_option: <parent_option_object>, checked_suboption: <suboption_object> }
  Service.demographicsKeyToOptions = (demographicsKey) ->
    optionKeys = demographicsKey.split(Service.DEMOGRAPHICS_KEY_DELIMITER)
    optionKey = optionKeys[0]
    suboptionKey = optionKeys[1]
    parentOption = Service.getTopLevelDemographicOption(optionKey)
    suboption = Service.getDemographicSuboption(parentOption, suboptionKey)
    {
      parent_option: parentOption,
      checked_suboption: suboption
    }

  # Similar to demographicsKeyToOptions but for lists of keys
  Service.demographicsKeysToOptionsList = (demographicsKeys) -> (Service.demographicsKeyToOptions(k) for k in demographicsKeys)

  # Given a demographic key, return the top level demographic (ex: "Asian - Chinese" -> "Asian")
  Service.getTopLevelDemographicKey = (demographicsKey) -> demographicsKey.split(Service.DEMOGRAPHICS_KEY_DELIMITER)[0]

  # "Asian - Chinese;White - European" -> { "Asian - Chinese": true, "White - European": true}
  Service.convertUserFieldToCheckboxValues = (userCombinedRaceString) ->
    result = {}
    if !userCombinedRaceString
      return result
    result[k] = true for k in userCombinedRaceString.split(Service.APPLICANT_RACE_ETHNICITY_DELIMITER)
    result

  # { "Asian - Chinese": true, "White - European": true, "White - Other": false} -> "Asian - Chinese;White - European"
  Service.convertCheckboxValuesToUserField = (checkboxValues) ->
    (k for k, checked of checkboxValues when checked).join(Service.APPLICANT_RACE_ETHNICITY_DELIMITER) || null

  return Service

ShortFormRaceEthnicityService.$inject = [
  '$translate',
  'ShortFormHelperService'
]

angular
  .module('dahlia.services')
  .service('ShortFormRaceEthnicityService', ShortFormRaceEthnicityService)
