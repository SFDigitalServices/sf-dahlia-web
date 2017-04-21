angular.module('dahlia.components')
.component 'rentBurdenPreferenceDashboard',
  bindings:
    application: '<'
    title: '@'
    translatedDescription: '@'
    required: '&'

  templateUrl: 'short-form/components/rent-burden-preference-dashboard.html'
  controller:
    ['ShortFormApplicationService','FileUploadService',
    (ShortFormApplicationService, FileUploadService) ->
      ctrl = @
      @groupedHouseholdAddresses = @application.groupedHouseholdAddresses

      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @resetPreferenceData = =>
        ShortFormApplicationService.cancelOptOut('rentBurden')
        listingId = ShortFormApplicationService.listing.Id
        # will delete files if any previously existed, if we are unchecking the box
        if !@application.preferences.rentBurden
          FileUploadService.deleteRentBurdenPreferenceFiles(listingId)

      return ctrl
  ]
