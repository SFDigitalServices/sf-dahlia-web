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

  $scope.submitForm = (options) ->
    form = $scope.form.applicationForm
    if (form.$valid)
      # submit
      if options.callback && $scope[options.callback]
        $scope[options.callback]()
      if options.path
        $state.go(options.path)

  $scope.inputInvalid = (name) ->
    form = $scope.form.applicationForm
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

  $scope.checkIfAlternateContactRequired = ->
    if $scope.applicantHasPhoneAndAddress()
      $state.go('dahlia.short-form-application.alternate-contact-type')
    else
      $state.go('dahlia.short-form-application.alternate-contact-required')

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
