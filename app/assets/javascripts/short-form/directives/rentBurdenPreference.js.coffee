angular.module('dahlia.directives')
.directive 'rentBurdenPreference', ->
  scope: true
  templateUrl: 'short-form/directives/rent-burden-preference.html'

  link: (scope, elem, attrs) ->
    scope.title = attrs.title
    scope.description = attrs.translatedDescription
    scope.preference = attrs.preference
    scope.pref_data_event = attrs.dataevent
    scope.address = attrs.address

    # NOTE: is this the right place for this?
    # initialize rentBurden_proof for this address
    scope.preferences.rentBurden_proof[scope.address] = {
      lease_file: {}
      rent_files: []
    }
