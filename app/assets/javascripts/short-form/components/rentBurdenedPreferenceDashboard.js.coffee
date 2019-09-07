angular.module('dahlia.components')
.component 'rentBurdenedPreferenceDashboard',
  bindings:
    application: '<'
    title: '@'
    translatedDescription: '@'
    required: '&'
    customInvalidMessage: '<'
    onUncheck: '&'

  templateUrl: 'short-form/components/rent-burdened-preference-dashboard.html'
  controller:
    ['ShortFormApplicationService','RentBurdenFileService', '$translate',
    (ShortFormApplicationService, RentBurdenFileService, $translate) ->
      ctrl = @
      @groupedHouseholdAddresses = @application.groupedHouseholdAddresses
      @addressLinkText = {}

      @initAddressLinkText = =>
        _.each @groupedHouseholdAddresses, (groupedAddress) =>
          address = groupedAddress.address
          @addressLinkText[address] =
            if @hasFiles(address) then $translate.instant('t.edit') else $translate.instant('label.start_upload')

      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @resetPreferenceData = =>
        ShortFormApplicationService.cancelOptOut('rentBurden')
        listingId = ShortFormApplicationService.listing.Id
        # will delete files if any previously existed, if we are unchecking the box
        if !@application.preferences.rentBurden
          # on uncheck
          RentBurdenFileService.deleteRentBurdenPreferenceFiles(listingId)
          @onUncheck()
        else
          # we are checking the box
          @initAddressLinkText()
          # ensure that we proceed through Preferences section without skipping ahead to Review
          ShortFormApplicationService.invalidatePreferencesForm()

      @hasFiles = (address) ->
        RentBurdenFileService.hasRentBurdenFiles(address)

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

      @initAddressLinkText()
      return ctrl
  ]
