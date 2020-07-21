do ->
  'use strict'
  describe 'ShortFormRaceEthnicityService', ->
    ShortFormRaceEthnicityService = undefined
    $translate = {
      instant: (key) -> "translated(#{key})"
    }
    fakeOptions = [
      {
        key: 'option1'
        translation_key: 'i18n_key_option_1'
        suboptions: [
          {
            key: 'suboption1',
            translation_key: 'i18n_key_suboption_1'
          }
        ]
      }
      {
        key: 'option2'
        translation_key: 'i18n_key_option_2'
        suboptions: [
          {
            key: 'suboption2',
            translation_key: 'i18n_key_suboption_2'
          }
          {
            key: 'suboption3',
            translation_key: 'i18n_key_suboption_3'
            free_text_key: 'suboption3Other'
            free_text_placeholder: 'i18n_key_suboption_3_placeholder'
          }
        ]
      }
    ]
    fakeShortFormHelperService = {
      race_and_ethnicity_options: fakeOptions
    }
    fakeApplicant =
      raceEthnicity: "option2 - suboption2;option2 - suboption3"
      suboption3Other: "suboption3OtherValue"

    beforeEach module('dahlia.services', ($provide)->
      $provide.value '$translate', $translate
      $provide.value 'ShortFormHelperService', fakeShortFormHelperService
      return
    )

    beforeEach inject((_ShortFormRaceEthnicityService_) ->
      ShortFormRaceEthnicityService = _ShortFormRaceEthnicityService_
      return
    )

    describe 'getTranslatedAccumulatorOption', ->
      it 'returns the translated option', ->
        parentOption = fakeOptions[0]
        suboption = parentOption.suboptions[0]
        expected = 'translated(i18n_key_option_1): translated(i18n_key_suboption_1)'
        expect(ShortFormRaceEthnicityService.getTranslatedAccumulatorOption(parentOption, suboption)).toEqual expected

      it 'returns the translated option with free text', ->
        parentOption = fakeOptions[1]
        suboption = parentOption.suboptions[1]
        freeText = 'some free text'
        expected = 'translated(i18n_key_option_2): translated(i18n_key_suboption_3) (some free text)'
        expect(ShortFormRaceEthnicityService.getTranslatedAccumulatorOption(parentOption, suboption, freeText)).toEqual expected

     describe 'getOptionKey', ->
      it 'returns the option key', ->
        parentOption = fakeOptions[0]
        suboption = parentOption.suboptions[0]
        expected = 'option1 - suboption1'
        expect(ShortFormRaceEthnicityService.getOptionKey(parentOption, suboption)).toEqual expected

     describe 'getOtherFreeTextKey', ->
      it 'returns the free text key', ->
        suboption = fakeOptions[1].suboptions[1]
        expected = 'suboption3Other'
        expect(ShortFormRaceEthnicityService.getOtherFreeTextKey(suboption)).toEqual expected

      it 'returns empty when no key exists', ->
        suboption = fakeOptions[0].suboptions[0]
        expected = ''
        expect(ShortFormRaceEthnicityService.getOtherFreeTextKey(suboption)).toEqual expected

    describe 'getTopLevelDemographicOption', ->
      it 'returns the top-level option for the key', ->
        optionKey = 'option2'
        expected = fakeOptions[1]
        expect(ShortFormRaceEthnicityService.getTopLevelDemographicOption(optionKey)).toEqual expected

    describe 'getTopLevelDemographicKey', ->
      it 'returns the top-level key from the full demographics key', ->
        demographicsKey = 'option2 - suboption2'
        expected = 'option2'
        expect(ShortFormRaceEthnicityService.getTopLevelDemographicKey(demographicsKey)).toEqual expected

    describe 'getDemographicsSuboption', ->
      it 'returns the suboption for the key', ->
        parentOption = fakeOptions[1]
        suboptionKey = 'suboption3'
        expected = fakeOptions[1].suboptions[1]
        expect(ShortFormRaceEthnicityService.getDemographicSuboption(parentOption, suboptionKey)).toEqual expected

    describe '_demographicsKeyToOptions', ->
      it 'returns the options for the given key', ->
        demographicKey = 'option2 - suboption3'
        expected =
          parent_option: fakeOptions[1]
          checked_suboption: fakeOptions[1].suboptions[1]
        expect(ShortFormRaceEthnicityService._demographicsKeyToOptions(demographicKey)).toEqual expected

    describe 'demographicsKeysToOptionsList', ->
      it 'returns the options for the given key', ->
        demographicKeys = [
          'option1 - suboption1'
          'option2 - suboption3'
        ]
        expected = [
          {
            parent_option: fakeOptions[0]
            checked_suboption: fakeOptions[0].suboptions[0]
          }
          {
            parent_option: fakeOptions[1]
            checked_suboption: fakeOptions[1].suboptions[1]
          }
        ]
        expect(ShortFormRaceEthnicityService.demographicsKeysToOptionsList(demographicKeys)).toEqual expected

     describe 'getFreeTextKeyFromDemographicKey', ->
      it 'returns the free text key when one exists', ->
        demographicKey = 'option2 - suboption3'
        expected = 'suboption3Other'
        expect(ShortFormRaceEthnicityService.getFreeTextKeyFromDemographicKey(demographicKey)).toEqual expected

      it 'returns an empty key when none exists', ->
        demographicKey = 'option2 - suboption2'
        expected = ''
        expect(ShortFormRaceEthnicityService.getFreeTextKeyFromDemographicKey(demographicKey)).toEqual expected

     describe 'convertUserFieldToCheckboxValues', ->
      it 'converts an empty string to {}', ->
        expect(ShortFormRaceEthnicityService.convertUserFieldToCheckboxValues('')).toEqual {}

      it 'converts null to {}', ->
        expect(ShortFormRaceEthnicityService.convertUserFieldToCheckboxValues(null)).toEqual {}

      it 'converts a single item correctly', ->
        expect(ShortFormRaceEthnicityService.convertUserFieldToCheckboxValues('key')).toEqual { 'key': true }

      it 'converts multiple items correctly', ->
        expected =
          'key1': true
          'key2': true
          'key3': true
        expect(ShortFormRaceEthnicityService.convertUserFieldToCheckboxValues('key1;key2;key3')).toEqual expected

      it 'converts fakeapplicant values correctly', ->
        expected =
          'option2 - suboption2': true
          'option2 - suboption3': true
        expect(ShortFormRaceEthnicityService.convertUserFieldToCheckboxValues(fakeApplicant.raceEthnicity)).toEqual expected

     describe 'convertCheckboxValuesToUserField', ->
      it 'converts {} to null', ->
        expect(ShortFormRaceEthnicityService.convertCheckboxValuesToUserField({})).toEqual null

      it 'converts single checked option correctly', ->
        expect(ShortFormRaceEthnicityService.convertCheckboxValuesToUserField({ 'key': true })).toEqual 'key'

      it 'converts multiple checked options correctly', ->
        checkedFields = {
          'key1': true
          'key2': true
          'key3': true
        }
        expected = 'key1;key2;key3'
        expect(ShortFormRaceEthnicityService.convertCheckboxValuesToUserField(checkedFields)).toEqual expected

      it 'skips false values', ->
        checkedFields = {
          'key1': true
          'key2': false
          'key3': true
        }
        expected = 'key1;key3'
        expect(ShortFormRaceEthnicityService.convertCheckboxValuesToUserField(checkedFields)).toEqual expected

      it 'returns null when all are false', ->
        checkedFields = {
          'key1': false
          'key2': false
          'key3': false
        }
        expected = null
        expect(ShortFormRaceEthnicityService.convertCheckboxValuesToUserField(checkedFields)).toEqual expected



