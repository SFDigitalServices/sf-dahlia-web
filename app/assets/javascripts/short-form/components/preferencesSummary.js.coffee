angular.module('dahlia.components')
.component 'preferencesSummary',
  templateUrl: 'short-form/components/preferences-summary.html'
  bindings:
    application: '<'
    listing: '<'
    preferences: '<'
  controller: [
    'ListingConstantsService', 'ShortFormApplicationService', 'ShortFormHelperService', '$filter', '$state', '$translate',
    (ListingConstantsService, ShortFormApplicationService, ShortFormHelperService, $filter, $state, $translate) ->
      ctrl = @

      ctrl.$onInit = ->
        ctrl.formatAndSortPrefs()

      ctrl.applicantHasNoPreferences = ShortFormApplicationService.applicantHasNoPreferences

      flagForI18n = ShortFormHelperService.flagForI18n

      ctrl.householdMemberForPreference = (pref_type) ->
        allMembers = angular.copy(ctrl.application.householdMembers)
        allMembers.push(ctrl.application.applicant)
        memberId = ctrl.application.preferences["#{pref_type}_household_member"]
        member = _.find(allMembers, { id: memberId })
        name = if member then "#{member.firstName} #{member.lastName}" else ''
        { user: name }

      ctrl.fileAttachmentsForRentBurden = ->
        if ctrl.application.status.match(/submitted/i)
          return [
            subLabel: $translate.instant('LABEL.FOR_YOUR_HOUSEHOLD')
            boldSubLabel: $translate.instant('LABEL.FILE_ATTACHED', { file: 'Lease and rent proof' })
          ]
        labels = []
        # this one is a little bit complicated because it has to sort through each set of rentBurden
        # address docs, and create an array of "For {{address}}: {{doc1}}, {{doc2}}... attached"
        _.each ctrl.application.preferences.documents.rentBurden, (docs, address) ->
          proofOptions = [docs.lease.proofOption]
          rentOptions = _.compact _.map docs.rent, (file) ->
            file.proofOption if file.file
          proofOptions = $filter('listify')(_.concat(proofOptions, rentOptions))
          labels.push({
            subLabel: $translate.instant('LABEL.FOR_USER', user: address)
            boldSubLabel: $translate.instant('LABEL.FILE_ATTACHED', { file: proofOptions })
          })
        return labels

      ctrl.certificateNumberForPreference = (pref_type) ->
        certificateNumber = ctrl.application.preferences["#{pref_type}_certificateNumber"]
        return '' unless certificateNumber
        $translate.instant('LABEL.CERTIFICATE_NUMBER') + ': ' + certificateNumber

      ctrl.fileAttachmentForPreference = (pref_type) ->
        proof = ctrl.application.preferences.documents[pref_type]
        return '' unless proof && proof.proofOption
        interpolate = { file: proof.proofOption }
        $translate.instant('LABEL.FILE_ATTACHED', interpolate)

      ctrl.claimedCustomPreference = (preference) ->
        !! ShortFormApplicationService.preferences[preference.listingPreferenceID]

      ctrl.formatAndSortPrefs = ->
        # Using the keys from the preferenceMap, check which preferences the
        # applicant has selected on this application. Create a list of info
        # for the selected preferences.
        selectedApplicationPrefs = []
        _.each ListingConstantsService.preferenceMap, (name, key) ->
          if ctrl.preferences[key]
            # Look up the listing preference that corresponds to this selected
            # preference - we'll use the listing preference to get the order
            matchingListingPref = _.find(ctrl.listing.preferences, {preferenceName: name})

            # Get the display name of this pref
            displayNameTranslateKey = switch key
              when 'certOfPreference' then flagForI18n('E7_PREFERENCES_PROGRAMS.CERT_OF_PREFERENCE')
              when 'displaced' then flagForI18n('E7_PREFERENCES_PROGRAMS.DISPLACED')
              when 'neighborhoodResidence' then flagForI18n('E2A_NEIGHBORHOOD_PREFERENCE.PREFERENCE.NAME')
              when 'antiDisplacement' then flagForI18n('E2B_ADHP_PREFERENCE.PREFERENCE.NAME')
              when 'liveInSf' then flagForI18n('E2C_LIVE_WORK_PREFERENCE.LIVE_SF_PREFERENCE.TITLE')
              when 'workInSf' then flagForI18n('E2C_LIVE_WORK_PREFERENCE.WORK_SF_PREFERENCE.TITLE')
              when 'assistedHousing' then flagForI18n('E3A_ASSISTED_HOUSING_PREFERENCE.PREFERENCE.TITLE')
              when 'rentBurden' then flagForI18n('E3B_RENT_BURDEN_PREFERENCE.RENT_BURDEN_PREFERENCE')
              when 'aliceGriffith' then flagForI18n('PREFERENCES.ALICE_GRIFFITH.TITLE')

            # If we didn't find a display name for this key, skip over it
            return unless displayNameTranslateKey

            displayName = $translate.instant(displayNameTranslateKey)

            # Gather the sublabels for this pref
            if key == 'rentBurden'
              rentBurdenSubLabels = ctrl.fileAttachmentsForRentBurden()
              subLabel = null
              boldSubLabel = null
            else
              rentBurdenSubLabels = null
              subLabel = $translate.instant('LABEL.FOR_USER', ctrl.householdMemberForPreference(key))

              if ['certOfPreference', 'displaced'].indexOf(key) >= 0
                boldSubLabel = ctrl.certificateNumberForPreference(key)
              else
                boldSubLabel = ctrl.fileAttachmentForPreference(key)

            selectedPrefInfo = {
              identifier: key,
              displayName: displayName,
              order: matchingListingPref.order,
              subLabel: subLabel,
              boldSubLabel: boldSubLabel,
              rentBurdenSubLabels: rentBurdenSubLabels
            }

            selectedApplicationPrefs.push(selectedPrefInfo)

        # Check which of the custom preferences the applicant has selected. Add
        # info for each selected custom pref to the list of selected prefs.
        _.each ctrl.listing.customPreferences, (pref) ->
          if ctrl.claimedCustomPreference(pref)
            selectedPrefInfo = {
              identifier: null,
              displayName: pref.preferenceName,
              order: pref.order,
              subLabel: $translate.instant('LABEL.FOR_USER', ctrl.householdMemberForPreference(pref.listingPreferenceID))
              boldSubLabel: null,
              rentBurdenSubLabels: null
            }
            selectedApplicationPrefs.push(selectedPrefInfo)

        # Check which of the custom proof preferences the applicant has selected.
        # Add info for each selected custom proof pref to the list of selected prefs.
        _.each ctrl.listing.customProofPreferences, (pref) ->
          if ctrl.claimedCustomPreference(pref)
            selectedPrefInfo = {
              identifier: null,
              displayName: pref.preferenceName,
              order: pref.order,
              subLabel: $translate.instant('LABEL.FOR_USER', ctrl.householdMemberForPreference(pref.listingPreferenceID))
              boldSubLabel: ctrl.fileAttachmentForPreference(pref.listingPreferenceID),
              rentBurdenSubLabels: null
            }
            selectedApplicationPrefs.push(selectedPrefInfo)

        # Sort the selected preferences by order
        ctrl.sortedApplicationPrefs = _.sortBy(selectedApplicationPrefs, 'order')

      return ctrl
  ]
