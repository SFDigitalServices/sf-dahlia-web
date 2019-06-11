angular.module('dahlia.components')
.component 'rentBurdenedPreference',
  bindings:
    application: '<'
    title: '@'
    translatedDescription: '@'
    groupedHouseholdAddressIndex: '<'
    required: '&'
    showCheckbox: '<'

  templateUrl: 'short-form/components/rent-burdened-preference.html'
  controller:
    ['ShortFormApplicationService', 'ShortFormHelperService', 'RentBurdenFileService', '$translate',
    (ShortFormApplicationService, ShortFormHelperService, RentBurdenFileService, $translate) ->
      ctrl = @
      @inputInvalid = (fieldName) ->
        ShortFormApplicationService.inputInvalid(fieldName)

      @showCheckbox = true if @showCheckbox == undefined
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
        @uploadedRentFiles = RentBurdenFileService.uploadedRentBurdenRentFiles(@address)

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
          RentBurdenFileService.deleteRentBurdenPreferenceFiles(listingId, @address).then =>
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
