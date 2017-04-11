angular.module('dahlia.directives')
.directive 'rentBurdenPreference',
['FileUploadService', (FileUploadService) ->
  templateUrl: 'short-form/directives/rent-burden-preference.html'
  scope: true

  link: (scope, elem, attrs) ->
    scope.title = attrs.title
    scope.description = attrs.translatedDescription
    scope.preference = attrs.preference
    scope.pref_data_event = attrs.dataevent
    scope.address = attrs.address
    # allows a hardcoded proof option, e.g. "Copy of Lease" rather than showing the selector
    scope.proofOption = attrs.proofOption || 'Copy of Lease'

    scope.reset_preference_data = (preference) ->
      scope.cancelOptOut(preference)

      # will delete files if any previously existed
      scope.deleteRentBurdenPreferenceFiles(scope.address)

      # initialize rentBurden_proof for this address
      # -- this will happen when you check the Rent Burden checkbox
      scope.preferences.rentBurden_proof[scope.address] = {
        lease_file: {}
        rent_files: []
      }

    ###### File functions

    scope.hasPreferenceFile = (opts) ->
      FileUploadService.hasRentBurdenFile(opts)

    scope.rentBurdenFile = (opts) ->
      FileUploadService.rentBurdenFile(opts)

    scope.deletePreferenceFile = (opts) ->
      FileUploadService.deletePreferenceFile('rentBurden', scope.listing.Id, opts)

    scope.deleteRentBurdenPreferenceFiles = (address) ->
      FileUploadService.deleteRentBurdenPreferenceFiles(scope.listing.Id, address)

    scope.preferenceFileError = (opts) ->
      FileUploadService.rentBurdenFileError(opts)

    scope.preferenceFileIsLoading = (opts) ->
      FileUploadService.rentBurdenFileIsLoading(opts)

]
