############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

NavController = ($document, $rootScope, $scope, $state, $timeout, $translate, AccountService, ModalService, ShortFormApplicationService) ->
  $scope.loggedIn = AccountService.loggedIn
  $scope.showNavMobile = false

  $scope.signOut = ->
    if ShortFormApplicationService.isShortFormPage($state.current)
      content =
        title: $translate.instant('t.leave_your_application')
        cancel: $translate.instant('t.stay')
        continue:  $translate.instant('t.leave')
        alert: true
        message: $translate.instant('t.are_you_sure_you_want_to_leave')
      ModalService.alert(content,
        onConfirm: ->
          AccountService.signOut()
          $state.go('dahlia.sign-in', { signedOut: true, skipConfirm: true })
      )
    else
      AccountService.signOut()
      $state.go('dahlia.sign-in', {signedOut: true})

  $scope.closeNavMobile = ->
    $scope.showNavMobile = false
    $scope.focusOnMenuButton()

  $scope.openNavMobile = ->
    $scope.showNavMobile = true

  $scope.focusOnNavMobile = (delay) ->
    $scope.focusOnElement('nav-mobile-topfocus', delay)

  $scope.focusOnMenuButton = (delay) ->
    $scope.focusOnElement('open-nav-mobile', delay)

  $scope.focusOnElement = (className, delay = 333) ->
    # put it on a slight delay so that it doesn't mess with the mobile nav slideout animation
    $timeout ->
      element = _.last $document[0].getElementsByClassName(className)
      element.focus()
    , delay, false

  $rootScope.$on '$stateChangeStart', ->
    # always close the mobile nav when state changes
    $scope.closeNavMobile() if $scope.showNavMobile

  $scope.trapFocus = (ev) ->
    # if mobile nav is open, and we're trying to "blur" away from the mobile nav,
    # then trap focus by refocusing on the nav (i.e. the close button at the top)
    return unless $scope.showNavMobile
    # check if we're blurring between '.nav-mobile-focus' items
    unless angular.element(ev.relatedTarget).hasClass('nav-mobile-focus')
      ev.stopPropagation()
      # nav is already open, no need to delay 333ms
      $scope.focusOnNavMobile(0)

############################################################################################
######################################## CONFIG ############################################
############################################################################################

NavController.$inject = [
  '$document', '$rootScope', '$scope', '$state', '$timeout', '$translate',
  'AccountService', 'ModalService', 'ShortFormApplicationService']

angular
  .module('dahlia.controllers')
  .controller('NavController', NavController)
