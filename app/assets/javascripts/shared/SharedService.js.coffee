############################################################################################
####################################### SERVICE ############################################
############################################################################################

SharedService = ($http, $state) ->
  Service = {}

  Service.showListingsNav = () ->
    ["favorites", "listing", "share"].indexOf($state.current.name) > -1

  Service.showFavoritesNav = () ->
    $state.current.name == "listings"

  Service.showSharing = () ->
    $state.current.name == "favorites"

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

SharedService.$inject = ['$http', '$state']

angular
  .module('dahlia.services')
  .service('SharedService', SharedService)
