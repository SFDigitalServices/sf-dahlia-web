ShortFormHelperService = ($translate, $filter) ->
  Service = {}

  Service.alternate_contact_options = [
    ['Family Member', $translate.instant('LABEL.FAMILY_MEMBER')]
    ['Friend', $translate.instant('LABEL.FRIEND')]
    ['Social Worker or Housing Counselor', $translate.instant('LABEL.SOCIAL_WORKER_OR_HOUSING_COUNSELOR')]
    ['Other', $translate.instant('LABEL.OTHER')]
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


  return Service

ShortFormHelperService.$inject = ['$translate', '$filter']

angular
  .module('dahlia.services')
  .service('ShortFormHelperService', ShortFormHelperService)
