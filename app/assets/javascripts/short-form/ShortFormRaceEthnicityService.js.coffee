ShortFormRaceEthnicityService = ($translate, ShortFormHelperService) ->
  Service = {}

  t = (translationKey) -> $translate.instant(translationKey)

  Service.DEMOGRAPHICS_KEY_DELIMITER = ' - '
  Service.APPLICANT_RACE_ETHNICITY_DELIMITER = ';'

  # Given an option, format it as a translated string to display in the accumulator.
  Service.getTranslatedAccumulatorOption = (parentOption, checkedSuboption, freeTextString) ->
    baseText = "#{t(parentOption.translated_name)}: #{t(checkedSuboption.translated_name)}"
    if freeTextString then "#{baseText} (#{freeTextString})" else baseText

  # Given parent and suboption objects, return the demographic option key (ex: "Asian - Chinese")
  Service.getOptionKey = (parentOption, checkedSuboption) ->
    parentOption.key + Service.DEMOGRAPHICS_KEY_DELIMITER + checkedSuboption.key

  # Given a suboption, get the associated field name for the free text on that option (ex: <asian-other-suboption-object> -> "asianOther")
  # Note if you pass a demographic key without a free text option, this will return an empty string (ex: <asian-chinese-suboption-object> -> '')
  Service.getOtherFreeTextKey = (checkedSuboption) ->
    if checkedSuboption.free_text_key then checkedSuboption.free_text_key else ''

  # Given a demographic key, get the associated field name for the free text on that option (ex: "Asian - Other" -> "asianOther")
  # Note if you pass a demographic key without a free text option, this will return an empty string (ex: "Asian - Chinese" -> '')
  Service.getFreeTextKeyFromDemographicKey = (demographicKey) ->
    options = Service._demographicsKeyToOptions(demographicKey)
    Service.getOtherFreeTextKey(options.checked_suboption)

  # Get the first item in an array that matches the predicate
  Service._findFirst = (arr, predicate) -> (i for i in arr when predicate(i))[0]

  # Get the parent demographic option object given the parent option key (ex: "Asian").
  Service.getTopLevelDemographicOption = (parentOptionKey) ->
    Service._findFirst(ShortFormHelperService.race_and_ethnicity_options, (o) -> o.key is parentOptionKey)

  # Given a top level option, find the child option that matches the suboptionKey.
  Service.getDemographicSuboption = (parentOption, suboptionKey) ->
    Service._findFirst(parentOption.suboptions, (suboption) -> suboption.key is suboptionKey)


  # "Asian - Chinese" -> { parent_option: <parent_option_object>, checked_suboption: <suboption_object> }
  Service._demographicsKeyToOptions = (demographicsKey) ->
    optionKeys = demographicsKey.split(Service.DEMOGRAPHICS_KEY_DELIMITER)
    optionKey = optionKeys[0]
    suboptionKey = optionKeys[1]
    parentOption = Service.getTopLevelDemographicOption(optionKey)
    suboption = Service.getDemographicSuboption(parentOption, suboptionKey)
    {
      parent_option: parentOption,
      checked_suboption: suboption
    }

  # Similar to _demographicsKeyToOptions but for lists of keys
  Service.demographicsKeysToOptionsList = (demographicsKeys) -> (Service._demographicsKeyToOptions(k) for k in demographicsKeys)

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
