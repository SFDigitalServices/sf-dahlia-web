############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShortFormApplicationController = ($scope, $state, ListingService, ShortFormApplicationService) ->

  $scope.form = {}
  $scope.$state = $state
  $scope.application = ShortFormApplicationService.application
  $scope.applicant = ShortFormApplicationService.applicant
  $scope.alternateContact = ShortFormApplicationService.alternateContact
  $scope.listing = ListingService.listing
  $scope.gender_options = ['Male', 'Female', 'Trans Male', 'Trans Female', 'Not listed', 'Decline to state']
  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false

  $scope.submitForm = (options) ->
    form = $scope.form.applicationForm
    if form.$valid
      # submit
      if options.callback && $scope[options.callback]
        $scope[options.callback]()
      if options.path
        $state.go(options.path)
    else
      $scope.hideAlert = false

  $scope.inputInvalid = (fieldName, identifier = '') ->
    form = $scope.form.applicationForm
    fieldName = if identifier then "#{identifier}_#{fieldName}" else fieldName
    field = form[fieldName]
    if form && field
      field.$invalid && (field.$touched || form.$submitted)

  $scope.inputValid = (fieldName, formName = 'applicationForm') ->
    form = $scope.form.applicationForm
    field = form[fieldName]
    field.$valid if form && field

  $scope.blankIfInvalid = (fieldName) ->
    form = $scope.form.applicationForm
    $scope.applicant[fieldName] = '' if form[fieldName].$invalid

  $scope.formattedAddress = (listing) ->
    ListingService.formattedAddress(listing)

  $scope.hasNav = ->
    $state.current.name != 'dahlia.short-form-application.intro'

  $scope.applicantHasPhoneAndAddress = ->
    $scope.applicant.phone_number && ShortFormApplicationService.validMailingAddress()

  $scope.missingPrimaryContactInfo = ->
    ShortFormApplicationService.missingPrimaryContactInfo()

  $scope.isMissingPrimaryContactInfo = (info) ->
    ShortFormApplicationService.missingPrimaryContactInfo().indexOf(info) > -1

  $scope.isMissingAddress = ->
    $scope.isMissingPrimaryContactInfo('Address')

  $scope.checkIfMailingAddressNeeded = ->
    unless $scope.applicant.separateAddress
      ShortFormApplicationService.copyHomeToMailingAddress()

  $scope.resetAndCheckMailingAddress = ->
    #reset mailing address
    $scope.applicant.mailing_address = {}
    $scope.checkIfMailingAddressNeeded()

  $scope.checkIfAlternateContactInfoNeeded = ->
    if $scope.alternateContact.type == 'None'
      # skip ahead if they aren't filling out an alt. contact
      $state.go('dahlia.short-form-application.optional-info')
    else
      $state.go('dahlia.short-form-application.alternate-contact-name')

  # <<<<<<< HEAD
  $scope.isActiveSection = (section) ->
    section.pages.indexOf($scope._currentPage()) > -1

  $scope.isPreviousSection = (section) ->
    sectionNames = $scope._sectionNames()
    indexOfActiveSection = sectionNames.indexOf($scope.activeSection().name)
    indexofSection = sectionNames.indexOf(section.name)
    indexofSection < indexOfActiveSection

  $scope.currentIndexofSection = () ->
    $scope.activeSection().pages.indexOf($scope._currentPage()) + 1

  $scope.totalIndexofSection = () ->
    $scope.activeSection().pages.length

  $scope._currentPage = () ->
    $state.current.name.replace('dahlia.short-form-application.', "")

  $scope.activeSection = () ->
    $scope._sectionOfPage($scope._currentPage())

  $scope._sectionOfPage = (stateName) ->
    currentSection = null
    $scope.sections.forEach (section) ->
      if section.pages.indexOf(stateName) > -1
        currentSection = section
    return currentSection

  $scope._sectionNames = () ->
    $scope.sections.map (section) ->
      return section.name
  # =======

  $scope.homeAddressRequired = ->
    !($scope.applicant.noAddress || $scope.applicant.separateAddress)

  $scope.truth = ->
    # wrap true value in a function a la function(){return true;}
    # used by isRequired() in _address_form
    true

ShortFormApplicationController.$inject = ['$scope', '$state', 'ListingService', 'ShortFormApplicationService']

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
