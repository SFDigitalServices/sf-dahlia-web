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
          # on uncheck
          FileUploadService.deleteRentBurdenPreferenceFiles(listingId)
          @onUncheck()
        else
          # we are checking the box
          # ensure that we proceed through Preferences section without skipping ahead to Review
          ShortFormApplicationService.invalidatePreferencesForm()

      @hasFiles = (address) =>
        files = @application.preferences.documents.rentBurden[address]
        return false unless files
        !!(files.lease.file || _.some(_.map(files.rent, 'file')))

      @hasCompleteFiles = (address) ->
        ShortFormApplicationService.hasCompleteRentBurdenFilesForAddress(address)

      @hasFileForType = (address, type) =>
        files = @application.preferences.documents.rentBurden[address]
        return false unless files
        if type == 'lease'
          !!files.lease.file
        else
          _.some(_.map(files.rent, 'file'))

      @addressInvalid = (address) =>
        !@hasCompleteFiles(address) && !!@customInvalidMessage

      @addressLinkText = (address) =>
        if @hasFiles(address) then $translate.instant('T.EDIT') else $translate.instant('LABEL.START_UPLOAD')

      @addressLinkText = (address) =>
        if @hasFiles(address) then $translate.instant('T.EDIT') else $translate.instant('LABEL.START_UPLOAD')

      return ctrl
  ]
