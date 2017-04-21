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
.filter 'nl2br', ->
  (input) ->
    return '' unless input
    input.trim().replace(/\n/g,'<br>')
.filter 'stripMostTags', ->
  # https://github.com/kvz/locutus/blob/master/src/php/strings/strip_tags.js
  (input, allowed) ->
    return '' unless input
    allowed = (((allowed or '<br><a>') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) or []).join('')
    tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi
    input.replace tags, ($0, $1) ->
      if allowed.indexOf('<' + $1.toLowerCase() + '>') > -1
        $0
      else
        ''
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
.filter 'ordinalSuffix', ->
  (n) ->
    s = ['th', 'st', 'nd', 'rd']
    v = n % 100
    (s[(v - 20) % 10] or s[v] or s[0])
.filter 'divideAndRoundDown', ->
  (input, divider) ->
    Math.floor(input / divider)
.filter 'listify', ->
  # will turn an array of items into a comma separated list, ending with "and" e.g.
  # ['john', 'jane', 'joe', 'dana'] | listify
  # 'john, jane, joe and dana'
  (input, fieldName) ->
    # input must be an array
    return '' unless input.length
    list = if fieldName then  _.map(input, fieldName) else input
    _.replace(list.join(', '), /,(?!.*,)/, ' and')
