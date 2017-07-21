ShortFormHelperService = ($translate, $filter, $sce, $state) ->
  Service = {}

  Service.alternate_contact_options = [
    ['Family Member', $translate.instant('LABEL.FAMILY_MEMBER')]
    ['Friend', $translate.instant('LABEL.FRIEND')]
    ['Social Worker or Housing Counselor', $translate.instant('LABEL.SOCIAL_WORKER_OR_HOUSING_COUNSELOR')]
    ['Other', $translate.instant('LABEL.OTHER')]
  ]
  Service.gender_options = [
    ['Female', $translate.instant('LABEL.FEMALE')]
    ['Male', $translate.instant('LABEL.MALE')]
    ['Genderqueer/Gender Non-binary', $translate.instant('LABEL.GENDERQUEER_NON_BINARY')]
    ['Trans Female', $translate.instant('LABEL.TRANS_FEMALE')]
    ['Trans Male', $translate.instant('LABEL.TRANS_MALE')]
    ['Not Listed', $translate.instant('LABEL.NOT_LISTED')]
  ]
  Service.relationship_options = [
    ['Spouse', $translate.instant('LABEL.SPOUSE')]
    ['Registered Domestic Partner', $translate.instant('LABEL.REGISTERED_DOMESTIC_PARTNER')]
    ['Parent', $translate.instant('LABEL.PARENT')]
    ['Child', $translate.instant('LABEL.CHILD')]
    ['Sibling', $translate.instant('LABEL.SIBLING')]
    ['Cousin', $translate.instant('LABEL.COUSIN')]
    ['Aunt', $translate.instant('LABEL.AUNT')]
    ['Uncle', $translate.instant('LABEL.UNCLE')]
    ['Nephew', $translate.instant('LABEL.NEPHEW')]
    ['Niece', $translate.instant('LABEL.NIECE')]
    ['Grandparent', $translate.instant('LABEL.GRANDPARENT')]
    ['Great Grandparent', $translate.instant('LABEL.GREAT_GRANDPARENT')]
    ['In-Law', $translate.instant('LABEL.IN_LAW')]
    ['Friend', $translate.instant('LABEL.FRIEND')]
    ['Other', $translate.instant('LABEL.OTHER')]
  ]
  Service.ethnicity_options = [
    ['Hispanic/Latino', $translate.instant('LABEL.HISPANIC_LATINO')]
    ['Not Hispanic/Latino', $translate.instant('LABEL.NOT_HISPANIC_LATINO')]
  ]
  Service.race_options = [
    ['American Indian/Alaskan Native', $translate.instant('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE')]
    ['Asian', $translate.instant('LABEL.ASIAN')]
    ['Black/African American', $translate.instant('LABEL.BLACK_AFRICAN_AMERICAN')]
    ['Native Hawaiian/Other Pacific Islander', $translate.instant('LABEL.NATIVE_HAWAIIAN_OTHER_PACIFIC_ISLANDER')]
    ['White', $translate.instant('LABEL.WHITE')]
    ['American Indian/Alaskan Native and Black/African American', $translate.instant('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE_BLACK')]
    ['American Indian/Alaskan Native and White', $translate.instant('LABEL.AMERICAN_INDIAN_ALASKAN_NATIVE_WHITE')]
    ['Asian and White', $translate.instant('LABEL.ASIAN_WHITE')]
    ['Black/African American and White', $translate.instant('LABEL.BLACK_AFRICAN_AMERICAN_WHITE')]
    ['Other/Multiracial', $translate.instant('LABEL.OTHER_MULTIRACIAL')]
  ]
  Service.sexual_orientation_options = [
    ['Bisexual', $translate.instant('LABEL.BISEXUAL')]
    ['Gay/Lesbian/Same-Gender Loving', $translate.instant('LABEL.GAY_LESBIAN_SAME_GENDER_LOVING')]
    ['Questioning/Unsure', $translate.instant('LABEL.QUESTIONING_UNSURE')]
    ['Straight/Heterosexual', $translate.instant('LABEL.STRAIGHT_HETEROSEXUAL')]
    ['Not Listed', $translate.instant('LABEL.NOT_LISTED')]
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
    allMembers = angular.copy(application.householdMembers)
    allMembers.push(application.applicant)
    memberId = application.preferences["#{pref_type}_household_member"]
    member = _.find(allMembers, { id: memberId })
    { user: "#{member.firstName} #{member.lastName}" }

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

  return Service

ShortFormHelperService.$inject = ['$translate', '$filter', '$sce', '$state']

angular
  .module('dahlia.services')
  .service('ShortFormHelperService', ShortFormHelperService)
