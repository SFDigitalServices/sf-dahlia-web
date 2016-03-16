############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ShortFormApplicationController = ($scope, $state, ListingService, ShortFormApplicationService) ->

  $scope.form = {}
  $scope.application = ShortFormApplicationService.application
  $scope.applicant = ShortFormApplicationService.applicant
  $scope.alternateContact = ShortFormApplicationService.alternateContact
  $scope.listing = ListingService.listing
  $scope.sections = [
    { name: 'You', pages: [
        'name',
        'contact',
        'alternate-contact-required',
        'alternate-contact-type',
        'alternate-contact-name',
        'alternate-contact-phone-address',
        'optional-info'
      ]
    },
    { name: 'Household', pages: ['intro'] },
    { name: 'Status', pages: ['intro'] },
    { name: 'Income', pages: ['intro'] },
    { name: 'Review', pages: ['intro'] }
  ]
  $scope.gender_options = ['Male', 'Female', 'Trans Male', 'Trans Female', 'Not listed', 'Decline to state']
  # hideAlert tracks if the user has manually closed the alert "X"
  $scope.hideAlert = false

  $scope.showAlert = ->
    form = $scope.form.applicationForm
    if form
      # show alert if we've submitted an invalid form, and we haven't manually hidden it
      form.$submitted && form.$invalid && $scope.hideAlert == false
    else
      false

  $scope.alertText = ->
    if $state.current.name == 'dahlia.short-form-application.alternate-contact-type'
      "Since you are not able to provide some of the required contact information, we'll need you to provide alternate contact information."
    else
      "You'll need to resolve any errors before moving on."

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

  $scope.inputInvalid = (name) ->
    form = $scope.form.applicationForm
    # console.log(form, name, form[name])
    form[name].$invalid && (form[name].$touched || form.$submitted)

  $scope.inputValid = (name) ->
    form = $scope.form.applicationForm
    form[name].$valid

  $scope.addressInputInvalid = ->
    form = $scope.form.applicationForm
    if form['address1']
      $scope.inputInvalid('address1') ||
      $scope.inputInvalid('city') ||
      $scope.inputInvalid('state') ||
      $scope.inputInvalid('zip')

  $scope.formattedAddress = (listing) ->
    ListingService.formattedAddress(listing)

  $scope.hasNav = ->
    $state.current.name != 'dahlia.short-form-application.intro'

  $scope.isActiveSection = (section) ->
    stateName = $state.current.name.replace('dahlia.short-form-application.', "")
    section.pages.indexOf(stateName) > -1

  $scope.applicantHasPhoneAndAddress = ->
    $scope.applicant.phone_number && ShortFormApplicationService.validMailingAddress()

  $scope.missingPrimaryContactInfo = ->
    ShortFormApplicationService.missingPrimaryContactInfo()

  $scope.isMissingPrimaryContactInfo = (info) ->
    ShortFormApplicationService.missingPrimaryContactInfo().indexOf(info) > -1

  $scope.checkIfMailingAddressNeeded = ->
    if !$scope.applicant.separateAddress
      ShortFormApplicationService.copyHomeToMailingAddress()

  $scope.checkSeparateAddress = ->
    #reset mailing address
    $scope.applicant.mailing_address = {}
    $scope.checkIfMailingAddressNeeded()

  $scope.checkIfAlternateContactInfoNeeded = ->
    if $scope.alternateContact.type == 'None'
      # skip ahead if they aren't filling out an alt. contact
      $state.go('dahlia.short-form-application.optional-info')
    else
      $state.go('dahlia.short-form-application.alternate-contact-name')

ShortFormApplicationController.$inject = ['$scope', '$state', 'ListingService', 'ShortFormApplicationService']

angular
  .module('dahlia.controllers')
  .controller('ShortFormApplicationController', ShortFormApplicationController)
