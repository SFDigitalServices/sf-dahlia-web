############################################################################################
####################################### SERVICE ############################################
############################################################################################

SharedService = ($http, $state) ->
  Service = {}
  Service.alternateLanguageLinks = []

  Service.showSharing = () ->
    $state.current.name == "dahlia.favorites"

  # method adapted from:
  # https://www.bignerdranch.com/blog/web-accessibility-skip-navigation-links
  Service.focusOnMainContent = ->
    main = angular.element(document.getElementById('main-content'))
    return unless main
    Service.focusOnElement(main)

  Service.focusOnElement = (el) ->
    # Setting 'tabindex' to -1 takes an element out of normal tab flow
    # but allows it to be focused via javascript
    el.attr 'tabindex', -1
    el.on 'blur focusout', ->
      # when focus leaves this element, remove the tabindex
      angular.element(@).removeAttr('tabindex')
    el[0].focus()
    # remove outline
    el[0].blur()

  Service.focusOnBody = ->
    body = angular.element(document.body)
    Service.focusOnElement(body)

  Service.updateAlternateLanguageLinks = ->
    angular.copy([], Service.alternateLanguageLinks)
    currentState = $state.current.name
    _.each ['en', 'es', 'tl', 'zh'], (lang) ->
      params = _.merge(angular.copy($state.current.params), {lang: lang})
      # because the homepage 'en' route gives a blank result when using {absolute: true}
      # we just use the relative href and append to the root_url printed by Rails in application.html
      href = $state.href($state.current.name, params)
      Service.alternateLanguageLinks.push(
        lang: lang
        href: href.slice(1)
      )

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

SharedService.$inject = ['$http', '$state']

angular
  .module('dahlia.services')
  .service('SharedService', SharedService)
