angular.module('dahlia.directives')
.directive 'communityScreeningHeader', ['$translate', ($translate) ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/community-screening-header.html'

  link: (scope, elem, attrs) ->
    listing = scope.listing
    restriction = listing.Reserved_Community_Requirement
    age = { minAge: listing.Reserved_community_minimum_age }

    switch listing.Reserved_community_type
      when 'Veteran'
        scope.title = $translate.instant('a2_community_screening.veteran.you_or_anyone')
        scope.description = $translate.instant('a2_community_screening.veteran.you_or_anyone_desc')
        scope.labels.communityScreeningYes = $translate.instant('t.yes')
        scope.communityEligibilityErrorMsg.push($translate.instant('error.veteran_anyone'))
      when 'Senior'
        if restriction == 'Entire household'
          scope.title = $translate.instant('a2_community_screening.senior.you_and_everyone')
          scope.description = $translate.instant('a2_community_screening.senior.you_and_everyone_desc', age)
          scope.labels.communityScreeningYes = $translate.instant('a2_community_screening.senior.you_and_everyone_label', age)
          scope.communityEligibilityErrorMsg.push($translate.instant('error.senior_everyone', age))
        else
          scope.title = $translate.instant('a2_community_screening.senior.you_or_anyone')
          scope.description = $translate.instant('a2_community_screening.senior.you_or_anyone_desc', age)
          scope.labels.communityScreeningYes = $translate.instant('a2_community_screening.senior.you_or_anyone_label', age)
          scope.communityEligibilityErrorMsg.push($translate.instant('error.senior_anyone', age))
      when 'Artist Live/Work'
        scope.title = $translate.instant('a2_community_screening.artist.you_or_anyone')
        scope.description = $translate.instant('a2_community_screening.artist.you_or_anyone_desc')
        scope.labels.communityScreeningYes = $translate.instant('t.yes')
        scope.communityEligibilityErrorMsg.push($translate.instant('error.artist_anyone'))

]
