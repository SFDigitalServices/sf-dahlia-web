ShortFormHelperService = ($translate, $filter) ->
  Service = {}

  Service.alternate_contact_options = [
    ['Family member', $translate.instant('LABEL.FAMILY_MEMBER')]
    ['Friend', $translate.instant('LABEL.FRIEND')]
    ['Social worker or housing counselor', $translate.instant('LABEL.SOCIAL_WORKER_OR_HOUSING_COUNSELOR')]
    ['Other', $translate.instant('LABEL.OTHER')]
  ]

  ## Review Page helpers
  Service.alternateContactRelationship = (alternateContact) ->
    if alternateContact.alternateContactType == 'None'
      $translate.instant('LABEL.NO_ALTERNATE_CONTACT')
    else if alternateContact.alternateContactType == 'Other'
      alternateContact.alternateContactTypeOther
    else
      alternateContact.alternateContactType

  Service.applicantLanguage = (applicant) ->
    if applicant.language == 'Other'
      applicant.languageOther
    else
      applicant.language

  Service.applicantVouchersSubsidies = (applicant) ->
    if applicant.household_vouchers_subsidies == 'Yes'
      $translate.instant('T.YES')
    else
      $translate.instant('T.NONE')

  Service.applicantIncomeAmount = (applicant) ->
    # applicant.incomeTimeframe
    income = parseFloat(applicant.incomeTotal)
    if applicant.incomeTimeframe == 'per_month'
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


  return Service

ShortFormHelperService.$inject = ['$translate', '$filter']

angular
  .module('dahlia.services')
  .service('ShortFormHelperService', ShortFormHelperService)
