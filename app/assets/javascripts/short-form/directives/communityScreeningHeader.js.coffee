angular.module('dahlia.directives')
.directive 'communityScreeningHeader', ['$translate', 'ListingService', ($translate, ListingService) ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/community-screening-header.html'

  link: (scope, elem, attrs) ->
    listing = ListingService.listing
    restriction = listing.STUB_CommunityRestriction
    age = { minAge: listing.Reserved_community_minimum_age }

    switch listing.Reserved_community_type
      when 'Veteran'
        scope.title = $translate.instant('A2_COMMUNITY_SCREENING.VETERAN.YOU_OR_ANYONE')
        scope.description = $translate.instant('A2_COMMUNITY_SCREENING.VETERAN.YOU_OR_ANYONE_DESC')
        scope.labels.communityScreeningYes = $translate.instant('T.YES')
      when 'Senior'
        if restriction == 'All People'
          scope.title = $translate.instant('A2_COMMUNITY_SCREENING.SENIOR.YOU_AND_EVERYONE')
          scope.description = $translate.instant('A2_COMMUNITY_SCREENING.SENIOR.YOU_AND_EVERYONE_DESC', age)
          scope.labels.communityScreeningYes = $translate.instant('A2_COMMUNITY_SCREENING.SENIOR.YOU_AND_EVERYONE_LABEL', age)
        else
          scope.title = $translate.instant('A2_COMMUNITY_SCREENING.SENIOR.YOU_OR_ANYONE')
          scope.description = $translate.instant('A2_COMMUNITY_SCREENING.SENIOR.YOU_OR_ANYONE_DESC', age)
          scope.labels.communityScreeningYes = $translate.instant('A2_COMMUNITY_SCREENING.SENIOR.YOU_OR_ANYONE_LABEL', age)

]
