angular.module('dahlia.directives')
.directive 'addressVerificationForm', ['$state', ($state) ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/address-verification-form.html'

  link: (scope, elem, attrs) ->
    scope.user = scope[attrs.user] if attrs.user
    # NOTE: currently assumes "home" and not "mailing" address since that's all we're using
    scope.user.confirmed_home_address = null
    scope.submitPath = attrs.submitPath
    scope.ngHref = $state.href(attrs.editPath)
    if attrs.user == 'householdMember'
      scope.ngHref = $state.href('dahlia.short-form-application.household-member-form-edit', {member_id: scope.householdMember.id})
]
