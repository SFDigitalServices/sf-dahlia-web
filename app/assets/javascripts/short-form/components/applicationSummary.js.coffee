angular.module('dahlia.components')
.component 'applicationSummary',
  templateUrl: 'short-form/components/application-summary.html'
  bindings:
    alternateContact: '<'
    applicant: '<'
    application: '<'
    householdMembers: '<'
    isRental: '<'
    isSale: '<'
    isHabitatListing: '<'
    isCustomEducatorListing: '<'
    listingHasHomeAndCommunityBasedServicesUnits: '<'
    listing: '<'
    preferences: '<'
    showVeteransApplicationQuestion: '<'
  controller: [
    '$filter', '$state', '$translate', 'LendingInstitutionService', 'ShortFormHelperService', 'ShortFormNavigationService', 'ShortFormRaceEthnicityService', 'ListingDataService',
    ($filter, $state, $translate, LendingInstitutionService, ShortFormHelperService, ShortFormNavigationService, ShortFormRaceEthnicityService, ListingDataService) ->
      ctrl = @

      ctrl.$onInit = ->
        appIsDraft = ctrl.application.status.toLowerCase() == 'draft'
        ctrl.atAutofillPreview =
          $state.current.name == "dahlia.short-form-application.autofill-preview"
        ctrl.atContinuePreviousDraft =
          $state.current.name == "dahlia.short-form-application.continue-previous-draft"
        ctrl.sectionsAreEditable = appIsDraft && !ctrl.atAutofillPreview && !ctrl.atContinuePreviousDraft

      ctrl.continueDraftApplicantHasUpdatedInfo = (field) ->
        current = ctrl.applicant
        old = ctrl.application.overwrittenApplicantInfo
        if field == 'name'
          fields = ['firstName', 'middleName', 'lastName']
          !_.isEqual(_.pick(current, fields), _.pick(old, fields))
        else if field == 'dob'
          currentDOB = "#{current.dob_day}/#{current.dob_month}/#{current.dob_year}"
          oldDOB = "#{old.dob_day}/#{old.dob_month}/#{old.dob_year}"
          currentDOB != oldDOB

      ctrl.preapprovalLetterAttached = ->
        if ctrl.atAutofillPreview then '' else $translate.instant('label.file_attached', {file: $translate.instant('label.preapproval_letter')})

      ctrl.verificationLetterAttached = ->
        if ctrl.atAutofillPreview then '' else $translate.instant('label.file_attached', {file: $translate.instant('label.verification_letter')})

      ctrl.prioritiesSelectedExists = ->
        !_.isEmpty(ctrl.application.adaPrioritiesSelected)

      ctrl.showHouseholdDetails = ->
        # If any of the household details items are present, show the section
        _.some([
          ctrl.prioritiesSelectedExists(), # has ADA priority question answered
          ctrl.application.hasPublicHousing,
          !_.isEmpty(ctrl.application.groupedHouseholdAddresses), # standin for rent-burdened question
          ctrl.application.hasMilitaryService, # this doesn't appear to be populated
          ctrl.application.hasDevelopmentalDisability, # this doesn't appear to be populated,
          ctrl.listingHasHomeAndCommunityBasedServicesUnits
        ])

      ctrl.applicationVouchersSubsidies = ->
        if ctrl.application.householdVouchersSubsidies == 'Yes'
          $translate.instant('t.yes')
        else
          $translate.instant('t.none')

      ctrl.applicationIncomeAmount = ->
        income = parseFloat(ctrl.application.householdIncome.incomeTotal)
        if ctrl.application.householdIncome.incomeTimeframe == 'per_month'
          phrase = $translate.instant('t.per_month')
        else
          phrase = $translate.instant('t.per_year')

        formatted_income = $filter('currency')(income, '$', 2)
        "#{formatted_income} #{phrase}"

      ctrl.getLendingAgentName = (agentId) ->
        LendingInstitutionService.getLendingAgentName(agentId)

      ctrl.getLendingInstitution = (agentId) ->
        LendingInstitutionService.getLendingInstitution(agentId)

      ctrl.alternateContactRelationship = ->
        if ctrl.alternateContact.alternateContactType == 'Other'
          ctrl.alternateContact.alternateContactTypeOther
        else
          ctrl.alternateContact.alternateContactType

      ctrl.getStartOfSection = (section) ->
        ShortFormNavigationService.getStartOfSection(section)

      ctrl.getStartOfHouseholdDetails = ->
        ShortFormNavigationService.getStartOfHouseholdDetails()

      ctrl.addressTranslateVariable = (address) ->
        { address: address }

      ctrl.membersTranslateVariable = (members) ->
        { user: $filter('listify')(members, "firstName")}

      ctrl.priority_options = ShortFormHelperService.priority_options

      ctrl.getRaceEthnicity = ->
        ShortFormRaceEthnicityService.salesforceToHumanReadable(ctrl.application.applicant)

      ctrl.applicationHasDemographicInfo = ->
        Boolean(ctrl.applicant.raceEthnicity or
          ctrl.applicant.primaryLanguage or
          ctrl.applicant.gender or
          ctrl.applicant.sexualOrientation or
          (!ctrl.showVeteransApplicationQuestion && ctrl.applicant.isVeteran) or
          (!ctrl.showVeteransApplicationQuestion && ctrl.application.isNonPrimaryMemberVeteran) or
          ctrl.applicant.referral
        )

      ctrl.showVeteransDemographics = ->
        ctrl.application.isVeteran && !ctrl.showVeteransApplicationQuestion

      ctrl.showNonPrimaryVeteransDemographics = ->
        ctrl.application.isNonPrimaryMemberVeteran && !ctrl.showVeteransApplicationQuestion

      ctrl.translatedYesNoNoAnswer = (val) ->
        if val == 'Yes'
          $translate.instant('t.yes')
        else if val == 'No'
          $translate.instant('t.no')
        else if val == 'Decline to state'
          $translate.instant('t.prefer_not_to_answer')

      ctrl.getIsVeteran = ->
        ctrl.translatedYesNoNoAnswer(ctrl.applicant.isVeteran)

      ctrl.getIsNonPrimaryMemberVeteran = ->
        ctrl.translatedYesNoNoAnswer(ctrl.application.isNonPrimaryMemberVeteran)

      ctrl.isDALPListing = ->
        ListingDataService.listing.Custom_Listing_Type == 'Downpayment Assistance Loan Program'

      ctrl.applicantHasClaimedDalpPriority = ->
        ctrl.application.dalpEducator == true || ctrl.application.dalpFirstResponder == true

      return ctrl
  ]
