angular.module('dahlia.components')
.component 'rentBurdenPreference',
  bindings:
    application: '<'
    title: '@'
    translatedDescription: '@'
    groupedHouseholdAddressIndex: '<'
    required: '&'

  templateUrl: 'short-form/components/rent-burden-preference.html'
  controller:
    ['ShortFormApplicationService', 'ShortFormHelperService', 'FileUploadService', '$translate',
    (ShortFormApplicationService, ShortFormHelperService, FileUploadService, $translate) ->
      ctrl = @
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @groupedHouseholdAddress = @application.groupedHouseholdAddresses[@groupedHouseholdAddressIndex]
      @address = @groupedHouseholdAddress.address
      @monthlyRent = @groupedHouseholdAddress.monthlyRent
      @members = @groupedHouseholdAddress.members
      @proofOptions = ShortFormHelperService.proofOptions('rentBurden')
      @additionalUploadActivated = false

      rentBurdenDocs = @application.preferences.documents.rentBurden
      @leaseDocument = rentBurdenDocs[@address].lease
      @rentDocuments = rentBurdenDocs[@address].rent

      @initUploadedRentFiles = =>
        @uploadedRentFiles = FileUploadService.uploadedRentBurdenRentFiles(@address)

      @initNewRentDocument = =>
        # init empty object for new uploads
        docId = new Date().getTime()
        @newRentDocument = {
          id: docId
        }
        @rentDocuments[docId] = @newRentDocument

      @showRentUploader = =>
        @uploadedRentFiles.length == 0 || @additionalUploadActivated

      @showAdditionalUploadButton = =>
        !@showRentUploader() && @members.length > 1 && @uploadedRentFiles.length > 0

      @resetPreferenceData = =>
        ShortFormApplicationService.cancelOptOut('rentBurden')
        listingId = ShortFormApplicationService.listing.Id
        # will delete files if any previously existed, if we are unchecking the box
        if !@application.preferences.rentBurden
          FileUploadService.deleteRentBurdenPreferenceFiles(listingId, @address).then =>
            @reinitializeFiles()
        else
          # we are checking the box for rent burden
          @reinitializeFiles()

      @afterUpload = =>
        @additionalUploadActivated = false
        @reinitializeFiles()

      @afterDelete = =>
        @initUploadedRentFiles()

      @reinitializeFiles = =>
        @initUploadedRentFiles()
        @initNewRentDocument()

      @reinitializeFiles()
      return ctrl

  ]
