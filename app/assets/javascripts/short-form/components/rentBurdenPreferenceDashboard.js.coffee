angular.module('dahlia.components')
.component 'rentBurdenPreferenceDashboard',
  bindings:
    application: '<'
    title: '@'
    translatedDescription: '@'
    required: '&'
    customInvalidMessage: '<'
    onUncheck: '&'

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
          @onUncheck()

      @hasFiles = (address) =>
        files = @application.preferences.documents.rentBurden[address]
        return false unless files
        files.lease.file || _.some(_.map(files.rent, 'file'))

      @hasCompleteFiles = (address) =>
        files = @application.preferences.documents.rentBurden[address]
        return false unless files
        files.lease.file && _.some(_.map(files.rent, 'file'))

      @addressInvalid = (address) =>
        !@hasCompleteFiles(address) && !!@customInvalidMessage

      @addressLinkText = (address) =>
        if @hasFiles(address) then $translate.instant('T.EDIT') else $translate.instant('LABEL.START_UPLOAD')

      return ctrl
  ]
