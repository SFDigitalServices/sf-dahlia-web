do ->
  'use strict'
  describe 'Rental Stats Component', ->
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

    fakeListing = {
      'unitSummaries': {
        'general': []
        'reserved': null
      }
    }

    mockTranslateCurrencyRange = (min, max) ->
      params = {
        currencyMinValue: min
        currencyMaxValue: max
      }
      $translate.instant('listings.stats.currency_range', params)

    mockSummaryIncome = (min, max) ->
      {
        absoluteMinIncome: min
        absoluteMaxIncome: max
      }

    mockSummaryRent = (min, max) ->
      {
        minMonthlyRent: min
        maxMonthlyRent: max
      }

    describe 'rentalStats', ->
      beforeEach ->
        ctrl = $componentController 'rentalStats', locals, { parent: fakeParent, listing: fakeListing }

      describe '$ctrl.rentRangeString', ->
        it 'returns empty if unit summary is null', ->
          expect(ctrl.rentRangeString(null)).toEqual ""

        it 'returns the correct string when min is null', ->
          fakeSummary = mockSummaryRent(null, 10)
          expectedString = '$10'
          expect(ctrl.rentRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string when min is 0', ->
          fakeSummary = mockSummaryRent(0, 10)
          expectedString = mockTranslateCurrencyRange('$0', '$10')
          expect(ctrl.rentRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string when min is non-0', ->
          fakeSummary = mockSummaryRent(100, 1000)
          expectedString = mockTranslateCurrencyRange('$100', '$1,000')
          expect(ctrl.rentRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string when max is less than min', ->
          fakeSummary = mockSummaryRent(100, 10)
          expectedString = '$100'
          expect(ctrl.rentRangeString(fakeSummary)).toEqual expectedString

      describe '$ctrl.incomeRangeString', ->
        it 'returns empty if unit summary is null', ->
          expect(ctrl.incomeRangeString(null)).toEqual ""

        it 'returns the correct string when minIncome is null', ->
          fakeSummary = mockSummaryIncome(null, 10)
          expectedString = mockTranslateCurrencyRange('$0', '$10')
          expect(ctrl.incomeRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string when minIncome is 0', ->
          fakeSummary = mockSummaryIncome(0, 10)
          expectedString = mockTranslateCurrencyRange('$0', '$10')
          expect(ctrl.incomeRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string when minIncome is non-0', ->
          fakeSummary = mockSummaryIncome(100, 1000)
          expectedString = mockTranslateCurrencyRange('$100', '$1,000')
          expect(ctrl.incomeRangeString(fakeSummary)).toEqual expectedString

        it 'returns the correct string when maxIncome is less than minIncome', ->
          fakeSummary = mockSummaryIncome(100, 10)
          expectedString = '$100'
          expect(ctrl.incomeRangeString(fakeSummary)).toEqual expectedString
