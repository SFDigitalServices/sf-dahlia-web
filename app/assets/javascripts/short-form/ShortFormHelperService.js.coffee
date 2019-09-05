ShortFormHelperService = ($translate, $filter, $sce, $state) ->
  Service = {}

  # the 'flagForI18n' identity function is purely so that the Gruntfile can know where to look
  # for these translation strings (see customRegex)
  Service.flagForI18n = (str) -> str

  Service.alternate_contact_options = [
    ['Family Member', Service.)]
    ['Friend', Service.)]
    ['Social Worker or Housing Counselor', Service.)]
    ['Other', Service.)]
  ]
  Service.gender_options = [
    ['Female', Service.)]
    ['Male', Service.)]
    ['Genderqueer/Gender Non-binary', Service.)]
    ['Trans Female', Service.)]
    ['Trans Male', Service.)]
    ['Not Listed', Service.)]
  ]

  Service.relationship_options = [
    ['Spouse', Service.)]
    ['Registered Domestic Partner', Service.)]
    ['Parent', Service.)]
    ['Child', Service.)]
    ['Sibling', Service.)]
    ['Cousin', Service.)]
    ['Aunt', Service.)]
    ['Uncle', Service.)]
    ['Nephew', Service.)]
    ['Niece', Service.)]
    ['Grandparent', Service.)]
    ['Great Grandparent', Service.)]
    ['In-Law', Service.)]
    ['Friend', Service.)]
    ['Other', Service.)]
  ]
  Service.ethnicity_options = [
    ['Hispanic/Latino', Service.)]
    ['Not Hispanic/Latino', Service.)]
  ]
  Service.race_options = [
    ['American Indian/Alaskan Native', Service.)]
    ['Asian', Service.)]
    ['Black/African American', Service.)]
    ['Native Hawaiian/Other Pacific Islander', Service.)]
    ['White', Service.)]
    ['American Indian/Alaskan Native and Black/African American', Service.)]
    ['American Indian/Alaskan Native and White', Service.)]
    ['Asian and White', Service.)]
    ['Black/African American and White', Service.)]
    ['Other/Multiracial', Service.)]
  ]
  Service.sexual_orientation_options = [
    ['Bisexual', Service.)]
    ['Gay/Lesbian/Same-Gender Loving', Service.)]
    ['Questioning/Unsure', Service.)]
    ['Straight/Heterosexual', Service.)]
    ['Not listed', Service.)]
  ]
  Service.preference_proof_options_default = [
    ['Telephone bill', Service.)],
    ['Cable and internet bill', Service.)],
    ['Gas bill', Service.)],
    ['Electric bill', Service.)],
    ['Garbage bill', Service.)],
    ['Water bill', Service.)],
    ['Paystub', Service.)],
    ['Public benefits record', Service.)],
    ['School record', Service.)],
  ]
  Service.preference_proof_options_work = [
    ['Paystub with employer address', Service.)],
    ['Letter from employer', Service.)],
  ]
  Service.preference_proof_options_live = angular.copy(Service.preference_proof_options_default)
  Service.preference_proof_options_live.push(
    ['Letter documenting homelessness', Service.)],
  )

  Service.preference_proof_options_rent_burden = [
    ['Money order', Service.)]
    ['Cancelled check', Service.)]
    ['Debit from your bank account', Service.)]
    ['Screenshot of online payment', Service.)]
  ]

  Service.preference_proof_options_alice_griffith = [
    ['Letter from SFHA verifying address', Service.)]
    ['CA ID or Driver\'s License', Service.)]
    ['Telephone bill (landline only)', Service.)]
    ['Cable and internet bill', Service.)]
    ['Paystub (listing home address)', Service.)]
    ['Public benefits record', Service.)]
    ['School record', Service.)]
  ]

  Service.priority_options = [
    ['Mobility impairments', Service.)]
    ['Vision impairments', Service.)]
    ['Hearing impairments', Service.)]
  ]

  Service.listing_referral_options = [
    ['Newspaper', Service.)]
    ['MOHCD Website', Service.)]
    ['Developer Website', Service.)]
    ['Flyer', Service.)]
    ['Email Alert', Service.)]
    ['Friend', Service.)]
    ['Housing Counselor', Service.)]
    ['Radio Ad', Service.)]
    ['Bus Ad', Service.)]
    ['Other', Service.)]
  ]

  Service.proofOptions = (preference) ->
    switch preference
      when 'workInSf'
        Service.preference_proof_options_work
      when 'liveInSf'
        Service.preference_proof_options_live
      when 'neighborhoodResidence'
        Service.preference_proof_options_live
      when 'rentBurden'
        Service.preference_proof_options_rent_burden
      when 'aliceGriffith'
        Service.preference_proof_options_alice_griffith
      else
        Service.preference_proof_options_default

  ## Translation Helpers
  Service.translateLoggedInMessage = (args) ->
    accountSettings =  $translate.instant('ACCOUNT_SETTINGS.ACCOUNT_SETTINGS')
    link = $state.href('dahlia.account-settings')
    markup = null
    if args.page == 'b1-name' && args.infoChanged
      nameEditable = $translate.instant('B1_NAME.NAME_EDITABLE_VIA')
      detailsUpdated = $translate.instant('B1_NAME.APP_DETAILS_UPDATED')
      markup = "#{detailsUpdated} #{nameEditable} <a href='#{link}'>#{accountSettings}</a>"
    if args.page == 'b1-name' && !args.infoChanged
      nameEditable = $translate.instant('B1_NAME.NAME_EDITABLE_VIA')
      markup = "#{nameEditable} <a href='#{link}'>#{accountSettings}</a>"
    else if args.page == 'b2-contact'
      nameEditable = $translate.instant('B2_CONTACT.EMAIL_EDITABLE_VIA')
      markup = "#{nameEditable} <a class='lined' href='#{link}'>#{accountSettings}</a>"
    return $sce.trustAsHtml(markup)

  return Service

ShortFormHelperService.$inject = ['$translate', '$filter', '$sce', '$state']

angular
  .module('dahlia.services')
  .service('ShortFormHelperService', ShortFormHelperService)
