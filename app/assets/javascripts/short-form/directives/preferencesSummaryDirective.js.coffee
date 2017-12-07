angular.module('dahlia.directives')
.directive 'preferencesSummary', ['$state', '$translate', ($state, $translate) ->
  restrict: 'E'
  replace: true
  scope: true
  templateUrl: 'short-form/directives/preferences-summary.html'

  link: (scope, elem, attrs) ->
    # Using the keys from the preferenceMap, check which preferences the
    # applicant has selected on this application. Create a list of info
    # about the selected preferences.
    selectedApplicationPrefs = []
    _.each scope.preferenceMap, (name, key) ->
      if scope.preferences[key]
        # Look up the listing preference that corresponds to this selected
        # preference - we'll use the listing preference to get the order
        matchingListingPref = _.find(scope.listing.preferences, {preferenceName: name})

        # Get the display name of this pref
        displayNameTranslateKey = switch key
          when 'certOfPreference' then 'E7_PREFERENCES_PROGRAMS.CERT_OF_PREFERENCE'
          when 'displaced' then 'E7_PREFERENCES_PROGRAMS.DISPLACED'
          when 'neighborhoodResidence' then 'E2A_NEIGHBORHOOD_PREFERENCE.PREFERENCE.NAME'
          when 'antiDisplacement' then 'E2B_ADHP_PREFERENCE.PREFERENCE.NAME'
          when 'liveInSf' then 'E2C_LIVE_WORK_PREFERENCE.LIVE_SF_PREFERENCE.TITLE'
          when 'workInSf' then 'E2C_LIVE_WORK_PREFERENCE.WORK_SF_PREFERENCE.TITLE'
          when 'assistedHousing' then 'E3A_ASSISTED_HOUSING_PREFERENCE.PREFERENCE.TITLE'
          when 'rentBurden' then 'E3B_RENT_BURDEN_PREFERENCE.RENT_BURDEN_PREFERENCE'
        displayName = $translate.instant(displayNameTranslateKey)

        # Gather the sublabels for this pref
        if key == 'rentBurden'
          rentBurdenSubLabels = scope.fileAttachmentsForRentBurden()
          subLabel = false
          boldSubLabel = false
        else
          rentBurdenSubLabels = false
          subLabel = $translate.instant('LABEL.FOR_USER', scope.householdMemberForPreference(key))

          if ['certOfPreference', 'displaced'].indexOf(key) < 0
            boldSubLabel = scope.fileAttachmentForPreference(key)
          else
            boldSubLabel = scope.certificateNumberForPreference(key)

        selectedPrefInfo = {
          identifier: key,
          displayName: displayName,
          order: matchingListingPref.order,
          subLabel: subLabel,
          boldSubLabel: boldSubLabel,
          rentBurdenSubLabels: rentBurdenSubLabels
        }

        selectedApplicationPrefs.push(selectedPrefInfo)

    # Sort the selected preferences by order
    scope.sortedApplicationPrefs = _.sortBy(selectedApplicationPrefs, 'order')
]
