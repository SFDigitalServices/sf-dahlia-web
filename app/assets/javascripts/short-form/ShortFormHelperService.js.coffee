ShortFormHelperService = ($translate, $filter, $sce, $state) ->
  Service = {}

  Service.alternate_contact_options = [
    ['Family Member', $translate.instant('LABEL.FAMILY_MEMBER')]
    ['Friend', $translate.instant('LABEL.FRIEND')]
    ['Social Worker or Housing Counselor', $translate.instant('LABEL.SOCIAL_WORKER_OR_HOUSING_COUNSELOR')]
    ['Other', $translate.instant('LABEL.OTHER')]
  ]

  Service.preference_proof_options_default = [
    ['Telephone bill', $translate.instant('LABEL.PROOF.TELEPHONE_BILL')],
    ['Cable and internet bill', $translate.instant('LABEL.PROOF.CABLE_BILL')],
    ['Gas bill', $translate.instant('LABEL.PROOF.GAS_BILL')],
    ['Electric bill', $translate.instant('LABEL.PROOF.ELECTRIC_BILL')],
    ['Garbage bill', $translate.instant('LABEL.PROOF.GARBAGE_BILL')],
    ['Water bill', $translate.instant('LABEL.PROOF.WATER_BILL')],
    ['Paystub', $translate.instant('LABEL.PROOF.PAYSTUB_HOME')],
    ['Public benefits record', $translate.instant('LABEL.PROOF.PUBLIC_BENEFITS')],
    ['School record', $translate.instant('LABEL.PROOF.SCHOOL_RECORD')],
  ]
  Service.preference_proof_options_work = [
    ['Paystub with employer address', $translate.instant('LABEL.PROOF.PAYSTUB_EMPLOYER')],
    ['Letter from employer', $translate.instant('LABEL.PROOF.LETTER_FROM_EMPLOYER')],
  ]
  Service.preference_proof_options_live = angular.copy(Service.preference_proof_options_default)
  Service.preference_proof_options_live.push(
    ['Letter documenting homelessness', $translate.instant('LABEL.PROOF.HOMELESSNESS')],
  )

  Service.priority_options = [
    ['Mobility', $translate.instant('LABEL.MOBILITY_IMPAIRMENTS')]
    ['Vision', $translate.instant('LABEL.VISION_IMPAIRMENTS')]
    ['Hearing', $translate.instant('LABEL.HEARING_IMPAIRMENTS')]
  ]

  ## Review Page helpers
  Service.alternateContactRelationship = (alternateContact) ->
    if alternateContact.alternateContactType == 'Other'
      alternateContact.alternateContactTypeOther
    else
      alternateContact.alternateContactType

  Service.applicationVouchersSubsidies = (application) ->
    if application.householdVouchersSubsidies == 'Yes'
      $translate.instant('T.YES')
    else
      $translate.instant('T.NONE')

  Service.applicationIncomeAmount = (application) ->
    income = parseFloat(application.householdIncome.incomeTotal)
    if application.householdIncome.incomeTimeframe == 'per_month'
      phrase = $translate.instant('T.PER_MONTH')
    else
      phrase = $translate.instant('T.PER_YEAR')

    yearly_income = $filter('currency')(income, '$', 2)
    "#{yearly_income} #{phrase}"

  Service.selectedPriorityNamesList = (application) ->
    prioritiesList = []

    _.each application.prioritiesSelected, (v1, k1) ->
      # properties in prioritiesSelected can have a true or false value,
      # so only process those with a true value
      if v1
        # find the translated name of this priority and add it to the priorities list string
        _.each Service.priority_options, (v2, k2) ->
          if v2[0] == k1 then prioritiesList.push(v2[1])

    return prioritiesList

  ## Translation Helpers
  Service.applicantFirstName = (applicant) ->
    name = applicant.firstName
    { name: if name then ', ' + name else '' }

  Service.householdMemberForPreference = (application, pref_type) ->
    { user: application.preferences["#{pref_type}_household_member"] }

  Service.fileAttachmentForPreference = (application, pref_type) ->
    return '' if application.status == 'Submitted'
    interpolate = { file: application.preferences["#{pref_type}_proof_option"] }
    $translate.instant('LABEL.FILE_ATTACHED', interpolate)

  Service.translateLoggedInMessage = (page) ->
    accountSettings =  $translate.instant('ACCOUNT_SETTINGS.ACCOUNT_SETTINGS')
    link = $state.href('dahlia.account-settings')
    markup = null
    if page == 'b1-name'
      nameEditable = $translate.instant('B1_NAME.NAME_EDITABLE_VIA')
      markup = "#{nameEditable} <a href='#{link}'>#{accountSettings}</a>"
    else if page == 'b2-contact'
      nameEditable = $translate.instant('B2_CONTACT.EMAIL_EDITABLE_VIA')
      markup = "#{nameEditable} <a class='lined' href='#{link}'>#{accountSettings}</a>"
    return $sce.trustAsHtml(markup)

  Service.addressTranslationVariable = (address) ->
    { address: _.startCase(_.toLower(address)) }

  Service.membersTranslationVariable = (members) ->
    { user: $filter('listify')(members) }

  return Service

ShortFormHelperService.$inject = ['$translate', '$filter', '$sce', '$state']

angular
  .module('dahlia.services')
  .service('ShortFormHelperService', ShortFormHelperService)
