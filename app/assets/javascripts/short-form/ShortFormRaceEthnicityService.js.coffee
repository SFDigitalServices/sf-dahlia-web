ShortFormRaceEthnicityService = ($translate, ShortFormHelperService) ->
  Service = {}

  t = (translationKey) -> $translate.instant(translationKey)

  Service.DEMOGRAPHICS_KEY_DELIMITER = ' - '
  Service.APPLICANT_RACE_ETHNICITY_DELIMITER = ';'

  Service.getTranslatedAccumulatorOption = (freeformText, parentOption, checkedSuboption) ->
    baseText = "#{t(parentOption.race_option[1])}: #{t(checkedSuboption.checkbox_option[1])}"
    if freeformText then "#{baseText} (#{freeformText})" else baseText

  Service.getOptionKey = (parentOption, checkedSuboption) ->
    parentOption.race_option[0] + Service.DEMOGRAPHICS_KEY_DELIMITER + checkedSuboption.checkbox_option[0]

  Service.getOtherFreeTextKey = (checkedSuboption) -> if checkedSuboption.text_option then checkedSuboption.text_option[0] else ''

  Service.getFreeTextKeyFromDemographicKey = (demographicKey) ->
    options = Service.demographicsKeyToOptions(demographicKey)
    Service.getOtherFreeTextKey(options.checked_suboption)

  Service.findFirst = (arr, predicate) -> (i for i in arr when predicate(i))[0]

  Service.getTopLevelDemographicOption = (optionKey) ->
    Service.findFirst(ShortFormHelperService.race_and_ethnicity_options, (o) -> o.race_option[0] is optionKey)

  Service.getDemographicSuboption = (option, suboptionKey) ->
    Service.findFirst(option.race_suboptions, (suboption) -> suboption.checkbox_option[0] is suboptionKey)

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

  Service.getTopLevelDemographicKey = (demographicsKey) -> demographicsKey.split(Service.DEMOGRAPHICS_KEY_DELIMITER)[0]

  # Take a string like "Asian - Chinese;White - European" and turn it into { "Asian - Chinese": true, "White - European": true}
  Service.convertUserFieldToCheckboxValues = (userRaceEthnicityString) ->
    result = {}
    if !userRaceEthnicityString
      return result
    result[k] = true for k in userRaceEthnicityString.split(Service.APPLICANT_RACE_ETHNICITY_DELIMITER)
    result

  # Take an object like { "Asian - Chinese": true, "White - European": true, "White - Other": false} and turn it into "Asian - Chinese;White - European"
  Service.convertCheckboxValuesToUserField = (checkboxValues) ->
    (k for k, checked of checkboxValues when checked).join(Service.APPLICANT_RACE_ETHNICITY_DELIMITER) || null

  Service.convertCheckboxValuesToAccumulatorOptions
  return Service

ShortFormRaceEthnicityService.$inject = [
  '$translate',
  'ShortFormHelperService'
]

angular
  .module('dahlia.services')
  .service('ShortFormRaceEthnicityService', ShortFormRaceEthnicityService)
