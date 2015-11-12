############################################################################################
####################################### SERVICE ############################################
############################################################################################

SharedService = ($http, $state) ->
  Service = {}

  Service.showListingsNav = () ->
    $state.current.name == "favorites" || $state.current.name == "listing"

  Service.showFavoritesNav = () ->
    $state.current.name == "listings"

  return Service


############################################################################################
######################################## CONFIG ############################################
############################################################################################

SharedService.$inject = ['$http', '$state']

angular
  .module('dahlia.services')
  .service('SharedService', SharedService)
