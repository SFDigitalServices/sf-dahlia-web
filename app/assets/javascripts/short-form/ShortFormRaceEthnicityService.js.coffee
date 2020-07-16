ShortFormRaceEthnicityService = ($translate, ShortFormHelperService) ->
  Service = {}

  Service.DEMOGRAPHICS_KEY_DELIMITER = ' - '

  Service.getTranslatedAccumulatorOption = (parentOption, checkedSuboption) ->
    $translate.instant(parentOption.race_option[1]) + ': ' + $translate.instant(checkedSuboption.checkbox_option[1])

  Service.getOptionKey = (parentOption, checkedSuboption) ->
      parentOption.race_option[0] + Service.DEMOGRAPHICS_KEY_DELIMITER + checkedSuboption.checkbox_option[0]

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
  return Service

ShortFormRaceEthnicityService.$inject = [
  '$translate',
  'ShortFormHelperService'
]

angular
  .module('dahlia.services')
  .service('ShortFormRaceEthnicityService', ShortFormRaceEthnicityService)
