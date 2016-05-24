ShortFormHelperService = ($translate, $filter) ->
  Service = {}

  ## Review Page helpers
  Service.alternateContactRelationship = (alternateContact) ->
    if alternateContact.type == 'None'
      $translate.instant('LABEL.NO_ALTERNATE_CONTACT')
    else if alternateContact.type == 'Other'
      alternateContact.other_relationship
    else
      alternateContact.type

  Service.applicantPrimaryLanguage = (applicant) ->
    if applicant.primary_language == 'Other'
      applicant.other_language
    else
      applicant.primary_language

  Service.applicantVouchersSubsidies = (applicant) ->
    if applicant.household_vouchers_subsidies == 'Yes'
      $translate.instant('T.YES')
    else
      $translate.instant('T.NONE')

  Service.applicantIncomeAmount = (applicant) ->
    # applicant.income_timeframe
    income = parseFloat(applicant.income_total)
    if applicant.income_timeframe == 'per_month'
      phrase = $translate.instant('T.PER_MONTH')
    else
      phrase = $translate.instant('T.PER_YEAR')

    yearly_income = $filter('currency')(income, '$', 2)
    "#{yearly_income} #{phrase}"



  ## Translation Helpers
  Service.applicantFirstName = (applicant) ->
    name = applicant.first_name
    { name: if name then ', ' + name else '' }

  Service.householdMemberForProgram = (applicant, pref_type) ->
    { user: applicant.preferences["#{pref_type}_household_member"] }


  return Service

ShortFormHelperService.$inject = ['$translate', '$filter']

angular
  .module('dahlia.services')
  .service('ShortFormHelperService', ShortFormHelperService)
