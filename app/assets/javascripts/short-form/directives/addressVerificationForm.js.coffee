angular.module('dahlia.directives')
.directive 'addressVerificationForm', ['$state', ($state) ->
  replace: true
  scope: true
  templateUrl: 'short-form/directives/address-verification-form.html'

  link: (scope, elem, attrs) ->
    # scope.user holds data for interacting with forms,
    # including preference data in this case
    if attrs.user
      scope.user = scope[attrs.user]
    else if attrs.preference
      scope.user = scope.application.preferences["#{attrs.preference}_address"]
    # NOTE: currently assumes "home" and not "mailing" address since that's all we're using
    scope.user.confirmed_home_address = null
    scope.ngHref = $state.href(attrs.editPath)
    if attrs.user == 'householdMember'
      scope.ngHref = $state.href('dahlia.short-form-application.household-member-form-edit', {member_id: scope.householdMember.id})
]
