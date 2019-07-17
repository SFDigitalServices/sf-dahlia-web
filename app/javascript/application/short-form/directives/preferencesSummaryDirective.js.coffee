angular.module('dahlia.directives')
.directive 'preferencesSummary', ['ShortFormHelperService', '$state', '$translate', (ShortFormHelperService, $state, $translate) ->
  restrict: 'E'
  replace: true
  scope: true
  template: require('html-loader!application/short-form/directives/preferences-summary.html')

  link: (scope, elem, attrs) ->


    scope.flagForI18n = (str) ->
      ShortFormHelperService.flagForI18n(str)
    # Using the keys from the preferenceMap, check which preferences the
    # applicant has selected on this application. Create a list of info
    # for the selected preferences.
    selectedApplicationPrefs = []
    _.each scope.preferenceMap, (name, key) ->
      if scope.preferences[key]
        # Look up the listing preference that corresponds to this selected
        # preference - we'll use the listing preference to get the order
        matchingListingPref = _.find(scope.listing.preferences, {preferenceName: name})

        # Get the display name of this pref
        displayNameTranslateKey = switch key
          when 'certOfPreference' then scope.flagForI18n('E7_PREFERENCES_PROGRAMS.CERT_OF_PREFERENCE')
          when 'displaced' then scope.flagForI18n('E7_PREFERENCES_PROGRAMS.DISPLACED')
          when 'neighborhoodResidence' then scope.flagForI18n('E2A_NEIGHBORHOOD_PREFERENCE.PREFERENCE.NAME')
          when 'antiDisplacement' then scope.flagForI18n('E2B_ADHP_PREFERENCE.PREFERENCE.NAME')
          when 'liveInSf' then scope.flagForI18n('E2C_LIVE_WORK_PREFERENCE.LIVE_SF_PREFERENCE.TITLE')
          when 'workInSf' then scope.flagForI18n('E2C_LIVE_WORK_PREFERENCE.WORK_SF_PREFERENCE.TITLE')
          when 'assistedHousing' then scope.flagForI18n('E3A_ASSISTED_HOUSING_PREFERENCE.PREFERENCE.TITLE')
          when 'rentBurden' then scope.flagForI18n('E3B_RENT_BURDEN_PREFERENCE.RENT_BURDEN_PREFERENCE')
          when 'aliceGriffith' then scope.flagForI18n('PREFERENCES.ALICE_GRIFFITH.TITLE')

        # If we didn't find a display name for this key, skip over it
        return unless displayNameTranslateKey

        displayName = $translate.instant(displayNameTranslateKey)

        # Gather the sublabels for this pref
        if key == 'rentBurden'
          rentBurdenSubLabels = scope.fileAttachmentsForRentBurden()
          subLabel = null
          boldSubLabel = null
        else
          rentBurdenSubLabels = null
          subLabel = $translate.instant('LABEL.FOR_USER', scope.householdMemberForPreference(key))

          if ['certOfPreference', 'displaced'].indexOf(key) >= 0
            boldSubLabel = scope.certificateNumberForPreference(key)
          else
            boldSubLabel = scope.fileAttachmentForPreference(key)

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
    _.each scope.listing.customPreferences, (pref) ->
      if scope.claimedCustomPreference(pref)
        selectedPrefInfo = {
          identifier: null,
          displayName: pref.preferenceName,
          order: pref.order,
          subLabel: $translate.instant('LABEL.FOR_USER', scope.householdMemberForPreference(pref.listingPreferenceID))
          boldSubLabel: null,
          rentBurdenSubLabels: null
        }
        selectedApplicationPrefs.push(selectedPrefInfo)

    # Check which of the custom proof preferences the applicant has selected.
    # Add info for each selected custom proof pref to the list of selected prefs.
    _.each scope.listing.customProofPreferences, (pref) ->
      if scope.claimedCustomPreference(pref)
        selectedPrefInfo = {
          identifier: null,
          displayName: pref.preferenceName,
          order: pref.order,
          subLabel: $translate.instant('LABEL.FOR_USER', scope.householdMemberForPreference(pref.listingPreferenceID))
          boldSubLabel: scope.fileAttachmentForPreference(pref.listingPreferenceID),
          rentBurdenSubLabels: null
        }
        selectedApplicationPrefs.push(selectedPrefInfo)

    # Sort the selected preferences by order
    scope.sortedApplicationPrefs = _.sortBy(selectedApplicationPrefs, 'order')
]
