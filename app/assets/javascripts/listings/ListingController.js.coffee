############################################################################################
###################################### CONTROLLER ##########################################
############################################################################################

ListingController = ($scope, $state, ListingService) ->
  $scope.listings = ListingService.listings
  $scope.listing = ListingService.listing

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingModule = angular.module('ListingModule', []);
ListingController.$inject = ['$scope', '$state', 'ListingService']
ListingModule.controller 'ListingController', ListingController
