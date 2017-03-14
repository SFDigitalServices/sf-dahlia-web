angular.module('dahlia.directives')
.directive 'communityScreeningHeader', ['$translate', 'ListingService', ($translate, ListingService) ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/community-screening-header.html'

  link: (scope, elem, attrs) ->
    scope.title = switch ListingService.listing.Reserved_community_type
      when 'Veteran' then $translate.instant('A2_COMMUNITY_SCREENING.VETERAN.YOU_OR_ANYONE')
      when 'Senior' then $translate.instant('A2_COMMUNITY_SCREENING.SENIOR.YOU_OR_ANYONE')

    scope.description = switch ListingService.listing.Reserved_community_type
      when 'Veteran' then $translate.instant('A2_COMMUNITY_SCREENING.VETERAN.YOU_OR_ANYONE_DESC')
      when 'Senior' then $translate.instant('A2_COMMUNITY_SCREENING.SENIOR.YOU_OR_ANYONE_DESC')
]
