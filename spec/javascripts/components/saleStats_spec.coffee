do ->
  'use strict'
  describe 'Sale Stats Component', ->
    $componentController = undefined
    ctrl = undefined
    locals = undefined
    $translate = {
      instant: (key, params) -> "translated(#{key}, #{JSON.stringify(params)})"
    }
    $filter =
      instant: jasmine.createSpy()
    fakeParent = {}
    beforeEach module('dahlia.components')
    beforeEach inject((_$componentController_, _$filter_) ->
      $componentController = _$componentController_
      locals = {
        $translate: $translate
        $filter: _$filter_
      }
    )
    summaryWithoutPrices = {
      'unitType': '1 BR'
      'listingID': 'a0W0P00000F8YG4UAN'
      'minIncome': 1300
      'maxIncome': 3300
    }

    summaryWithMinWithoutParkingPrice = {
      'unitType': '1 BR'
      'minPriceWithoutParking': 4000
      'listingID': 'a0W0P00000F8YG4UAN'
      'minIncome': 1400
      'maxIncome': 3400
    }

    summaryWithMinWithParkingPrice = {
      'unitType': '1 BR'
      'minPriceWithParking': 4000
      'listingID': 'a0W0P00000F8YG4UAN'
      'minIncome': 1500
      'maxIncome': 3500
    }

    fakeListing = {
      'unitSummaries': {
        'general': [summaryWithoutPrices, summaryWithMinWithoutParkingPrice]
        'reserved': null
      }
    }

    mockTranslateCurrencyRange = (min, max) ->
      params = {
        currencyMinValue: min
        currencyMaxValue: max
      }
      $translate.instant('listings.stats.currency_range', params)

    mockTranslateHoaString = (hoaPriceString) ->
      $translate.instant('listings.stats.hoa_dues_label', { hoaPriceValue: hoaPriceString })

    mockSummaryHoaPrices = (minWithParking = null, maxWithParking = null, minWithoutParking = null, maxWithoutParking = null) ->
      {
        minHoaDuesWithParking: minWithParking
        maxHoaDuesWithParking: maxWithParking
        minHoaDuesWithoutParking: minWithoutParking
        maxHoaDuesWithoutParking: maxWithoutParking
      }

    mockSummarySalesPrices = (minWithParking = null, maxWithParking = null, minWithoutParking = null, maxWithoutParking = null) ->
      {
        minPriceWithParking: minWithParking
        maxPriceWithParking: maxWithParking
        minPriceWithoutParking: minWithoutParking
        maxPriceWithoutParking: maxWithoutParking
      }

    describe 'saleStats', ->
      beforeEach ->
        ctrl = $componentController 'saleStats', locals, { parent: fakeParent, listing: fakeListing }

      describe '$ctrl.hasUnitsWithoutParking', ->
        it 'returns true if a listing has a general unit with a without-parking price', ->
          listing = {
            'unitSummaries': {
              'general': [summaryWithoutPrices, summaryWithMinWithoutParkingPrice],
              'reserved': null
            }
          }
          expect(ctrl.hasUnitsWithoutParking(listing)).toEqual true
        it 'returns true if a listing has a reserved unit with a without-parking price', ->
          listing = {
            'unitSummaries': {
              'general': null,
              'reserved': [summaryWithoutPrices, summaryWithMinWithoutParkingPrice]
            }
          }
          expect(ctrl.hasUnitsWithoutParking(listing)).toEqual true
        it 'returns false if a listing has no units with a without-parking price', ->
          listing = {
            'unitSummaries': {
              'general': [summaryWithoutPrices, summaryWithoutPrices],
              'reserved': null
            }
          }
          expect(ctrl.hasUnitsWithoutParking(listing)).toEqual false

        it 'returns false if a listing has no units', ->
          listing = {'unitSummaries': {'general': null, 'reserved': null}}
          expect(ctrl.hasUnitsWithoutParking(listing)).toEqual false

      describe '$ctrl.hasUnitsWithParking', ->
        it 'returns true if a listing has a general unit with a with-parking price', ->
          listing = {
            'unitSummaries': {
              'general': [summaryWithoutPrices, summaryWithMinWithParkingPrice],
              'reserved': null
            }
          }
          expect(ctrl.hasUnitsWithParking(listing)).toEqual true
        it 'returns true if a listing has a reserved unit with a with-parking price', ->
          fakeSummaries = [
            {
              'unitType': '1 BR',
              'listingID': 'a0W0P00000F8YG4UAN'},
            {
              'unitType': '1 BR',
              'minPriceWithParking': 4000,
              'listingID': 'a0W0P00000F8YG4UAN'
            }]
          listing = {'unitSummaries': {'general': null, 'reserved': fakeSummaries}}
          expect(ctrl.hasUnitsWithParking(listing)).toEqual true
        it 'returns false if a listing has no units with a with-parking price', ->
          listing = {
            'unitSummaries': {
              'general': [summaryWithoutPrices, summaryWithoutPrices],
              'reserved': null
            }
          }
          expect(ctrl.hasUnitsWithParking(listing)).toEqual false

        it 'returns false if a listing has no units', ->
          listing = {'unitSummaries': {'general': null, 'reserved': null}}
          expect(ctrl.hasUnitsWithParking(listing)).toEqual false

      describe '$ctrl.hasRangeOfPricesWithoutParking', ->
        it 'returns true if max is greater than min', ->
          fakeSummary = {
            'unitType': '1 BR',
            'minPriceWithoutParking': 4000,
            'maxPriceWithoutParking': 6000,
            'listingID': 'a0W0P00000F8YG4UAN'
          }
          expect(ctrl.hasRangeOfPricesWithoutParking(fakeSummary)).toEqual true
        it 'returns false if max or min is not defined', ->
          expect(ctrl.hasRangeOfPricesWithoutParking(summaryWithoutPrices)).toEqual false
        it 'returns false if max and min are equal', ->
          fakeSummary = {
            'unitType': '1 BR',
            'minPriceWithoutParking': 4000,
            'maxPriceWithoutParking': 4000,
            'listingID': 'a0W0P00000F8YG4UAN'
          }
          expect(ctrl.hasRangeOfPricesWithoutParking(fakeSummary)).toEqual false

      describe '$ctrl.hasRangeOfPricesWithParking', ->
        it 'returns true if max is greater than min', ->
          fakeSummary = {
            'unitType': '1 BR',
            'minPriceWithParking': 4000,
            'maxPriceWithParking': 6000,
            'listingID': 'a0W0P00000F8YG4UAN'
          }
          expect(ctrl.hasRangeOfPricesWithParking(fakeSummary)).toEqual true
        it 'returns false if max or min is not defined', ->
          expect(ctrl.hasRangeOfPricesWithParking(summaryWithoutPrices)).toEqual false
        it 'returns false if max and min are equal', ->
          fakeSummary = {
            'unitType': '1 BR',
            'minPriceWithParking': 4000,
            'maxPriceWithParking': 4000,
            'listingID': 'a0W0P00000F8YG4UAN'
          }
          expect(ctrl.hasRangeOfPricesWithParking(fakeSummary)).toEqual false

      describe '$ctrl.incomeRangeString', ->
        it 'returns the correct string when only minIncome specified', ->
          fakeSummary = { minIncome: 1500 }
          expect(ctrl.incomeRangeString(fakeSummary)).toEqual '$1,500'

        it 'returns the correct string when only maxIncome specified', ->
          fakeSummary = { maxIncome: 3500 }
          expect(ctrl.incomeRangeString(fakeSummary)).toEqual '$3,500'

        it 'returns the correct string when both min and max incomes specified', ->
          fakeSummary = { minIncome: 1500, maxIncome: 3500 }
          expectedString = mockTranslateCurrencyRange('$1,500', '$3,500')
          expect(ctrl.incomeRangeString(fakeSummary)).toEqual expectedString

        it 'returns empty string when neither min or max income specified', ->
          fakeSummary = {}
          expect(ctrl.incomeRangeString(fakeSummary)).toEqual ''

      describe '$ctrl.salesPriceRangeString', ->
        it 'returns the correct string with only parking values specified', ->
          fakeSummary = mockSummarySalesPrices(10000, 100000)
          expectedString = mockTranslateCurrencyRange('$10,000', '$100,000')
          expect(ctrl.salesPriceRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string with only non-parking values specified', ->
          fakeSummary = mockSummarySalesPrices(null, null, 10000, 100000)
          expectedString = mockTranslateCurrencyRange('$10,000', '$100,000')
          expect(ctrl.salesPriceRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string when parking is more expensive', ->
          fakeSummary = mockSummarySalesPrices(12000, 120000, 10000, 100000)
          expectedString = mockTranslateCurrencyRange('$10,000', '$120,000')
          expect(ctrl.salesPriceRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string when without parking is more expensive', ->
          fakeSummary = mockSummarySalesPrices(10000, 100000, 12000, 120000)
          expectedString = mockTranslateCurrencyRange('$10,000', '$120,000')
          expect(ctrl.salesPriceRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string when mix of with/without parking is more expensive', ->
          fakeSummary = mockSummarySalesPrices(10000, 120000, 12000, 100000)
          expectedString = mockTranslateCurrencyRange('$10,000', '$120,000')
          expect(ctrl.salesPriceRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string when parking values are null', ->
          fakeSummary = mockSummarySalesPrices(null, null, 12000, 100000)
          expectedString = mockTranslateCurrencyRange('$12,000', '$100,000')
          expect(ctrl.salesPriceRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string when non-parking values are null', ->
          fakeSummary = mockSummarySalesPrices(12000, 120000)
          expectedString = mockTranslateCurrencyRange('$12,000', '$120,000')
          expect(ctrl.salesPriceRangeString(fakeSummary)).toEqual expectedString

        it 'returns empty string when all values are null', ->
          fakeSummary = mockSummarySalesPrices()

          expectedString = ''
          expect(ctrl.salesPriceRangeString(fakeSummary)).toEqual expectedString

        it 'returns empty string when empty object is passed', ->
          fakeSummary = {}
          expectedString = ''
          expect(ctrl.salesPriceRangeString(fakeSummary)).toEqual expectedString

        it 'returns empty string when null object is passed', ->
          fakeSummary = null
          expectedString = ''
          expect(ctrl.salesPriceRangeString(fakeSummary)).toEqual expectedString

      describe '$ctrl.hoaDuesSubtitleString', ->
        it 'returns the correct string with only parking values specified', ->
          fakeSummary = mockSummaryHoaPrices(500, 800)
          expectedCurrencyString = mockTranslateCurrencyRange('$500', '$800')
          expect(ctrl.hoaDuesSubtitleString(fakeSummary)).toEqual mockTranslateHoaString(expectedCurrencyString)

        it 'returns the correct string with only non-parking values specified', ->
          fakeSummary = mockSummaryHoaPrices(null, null, 500, 800)
          expectedCurrencyString = mockTranslateCurrencyRange('$500', '$800')
          expect(ctrl.hoaDuesSubtitleString(fakeSummary)).toEqual mockTranslateHoaString(expectedCurrencyString)

        it 'returns the correct string when parking is more expensive', ->
          fakeSummary = mockSummaryHoaPrices(500, 800, 400, 700)
          expectedCurrencyString = mockTranslateCurrencyRange('$400', '$800')
          expect(ctrl.hoaDuesSubtitleString(fakeSummary)).toEqual mockTranslateHoaString(expectedCurrencyString)

        it 'returns the correct string when without parking is more expensive', ->
          fakeSummary = mockSummaryHoaPrices(500, 800, 600, 900)
          expectedCurrencyString = mockTranslateCurrencyRange('$500', '$900')
          expect(ctrl.hoaDuesSubtitleString(fakeSummary)).toEqual mockTranslateHoaString(expectedCurrencyString)

        it 'returns the correct string when mix of with/without parking is more expensive', ->
          fakeSummary = mockSummaryHoaPrices(500, 120000, 600, 100000)

          expectedCurrencyString = mockTranslateCurrencyRange('$500', '$120,000')
          expect(ctrl.hoaDuesSubtitleString(fakeSummary)).toEqual mockTranslateHoaString(expectedCurrencyString)

        it 'returns the correct string when min values are null', ->
          fakeSummary = mockSummaryHoaPrices(null, 500, null, 800)
          expect(ctrl.hoaDuesSubtitleString(fakeSummary)).toEqual mockTranslateHoaString('$800')

        it 'returns the correct string when max values are null', ->
          fakeSummary = mockSummaryHoaPrices(500, null, 600, null)
          expect(ctrl.hoaDuesSubtitleString(fakeSummary)).toEqual mockTranslateHoaString('$500')

        it 'returns empty string when all values are null', ->
          fakeSummary = mockSummaryHoaPrices()

          expectedString = ''
          expect(ctrl.hoaDuesSubtitleString(fakeSummary)).toEqual expectedString

        it 'returns empty string when empty object is passed', ->
          fakeSummary = {}
          expectedString = ''
          expect(ctrl.hoaDuesSubtitleString(fakeSummary)).toEqual expectedString

        it 'returns empty string when null object is passed', ->
          fakeSummary = null
          expectedString = ''
          expect(ctrl.hoaDuesSubtitleString(fakeSummary)).toEqual expectedString

