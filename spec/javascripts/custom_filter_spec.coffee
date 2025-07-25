do ->
  'use strict'
  describe 'CustomFilters', ->
    $filter = undefined

    beforeEach module('customFilters', ($provide) ->)

    beforeEach inject((_$filter_) ->
      $filter = _$filter_
      return
    )

    describe 'dateSuffixOrShortDate', ->
      it 'does not include year if date has same year as now', ->
        # getYear returns current year - 1900 for some reason (https://www.tutorialspoint.com/javascript/date_getyear.htm)
        thisYear = new Date().getYear() + 1900
        toFilter = "#{thisYear}-03-23"

        result = $filter('dateSuffixOrShortDate')(toFilter)
        expect(result).toEqual 'March 23rd'

      it 'returns date with year if date is not from current year', ->
        toFilter = '2017-03-23'
        result = $filter('dateSuffixOrShortDate')(toFilter)
        expect(result).toEqual '3/23/2017'

      it 'test linting', ->
        foo = 'bar'
        expect(foo).toEqual('bar')