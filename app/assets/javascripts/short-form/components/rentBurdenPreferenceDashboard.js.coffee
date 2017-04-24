angular.module('dahlia.components')
.component 'rentBurdenPreferenceDashboard',
  bindings:
    application: '<'
    title: '@'
    translatedDescription: '@'
    required: '&'

  templateUrl: 'short-form/components/rent-burden-preference-dashboard.html'
  controller:
    ['ShortFormApplicationService','FileUploadService', '$translate',
    (ShortFormApplicationService, FileUploadService, $translate) ->
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

      @hasFiles = (address) =>
        files = @application.preferences.documents.rentBurden[address]
        files.lease.file || _.some(_.map(files.rent, 'file'))

      @addressLinkText = (address) =>
        if @hasFiles(address) then $translate.instant('T.EDIT') else $translate.instant('LABEL.START_UPLOAD')

      return ctrl
  ]
