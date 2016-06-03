# dateSuffix filter adapted from http://stackoverflow.com/a/24060984/260495
angular.module('customFilters', [])
.filter 'dateSuffix', ['$filter', ($filter) ->
  (input) ->
    return '' unless input
    suffixes = ['th', 'st', 'nd', 'rd']
    dtfilter = $filter('date')(input, 'MMMM d')
    day = parseInt(dtfilter.slice(-2))
    relevantDigits = if day < 30 then day % 20 else day % 30
    suffix = if relevantDigits <= 3 then suffixes[relevantDigits] else suffixes[0]
    dtfilter + suffix
  ]
.filter 'htmlTel', ['$filter', ($filter) ->
  (input) ->
    return '' unless input
    input.toString().trim().replace(/\D/g,'')
  ]
.filter 'nl2br', ['$filter', ($filter) ->
  (input) ->
    return '' unless input
    input.trim().replace(/\n/g,'<br>')
  ]
.filter 'incomeTimeframe', ['$filter', ($filter) ->
  (input) ->
    # just return 'month' or 'year' and get rid of the 'per_'
    return '' unless input
    input.split('per_')[1]
  ]
.filter 'tel', -> #http://jsfiddle.net/jorgecas99/S7aSj/
  (tel) ->
    if !tel
      return ''
    value = tel.toString().trim().replace(/^\+/, '')
    if value.match(/[^0-9]/)
      return tel
    country = undefined
    city = undefined
    number = undefined
    switch value.length
      when 10
        # +1PPP####### -> C (PPP) ###-####
        country = 1
        city = value.slice(0, 3)
        number = value.slice(3)
      when 11
        # +CPPP####### -> CCC (PP) ###-####
        country = value[0]
        city = value.slice(1, 4)
        number = value.slice(4)
      when 12
        # +CCCPP####### -> CCC (PP) ###-####
        country = value.slice(0, 3)
        city = value.slice(3, 5)
        number = value.slice(5)
      else
        return tel
    if country == 1
      country = ''
    number = number.slice(0, 3) + '-' + number.slice(3)
    (country + ' (' + city + ') ' + number).trim()
