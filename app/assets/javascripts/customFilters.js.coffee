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
