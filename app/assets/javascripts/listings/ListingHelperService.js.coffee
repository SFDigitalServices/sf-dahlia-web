############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingHelperService = (ListingConstantsService) ->
  Service = {}

  Service.listingIs = (name, listing) ->
    return false unless listing && name
    ListingConstantsService.LISTING_MAP[listing.Id] == name

  Service.isFirstComeFirstServe = (listing) ->
    return false unless listing
    # hardcoded, currently just this one listing
    Service.listingIs('168 Hyde Relisting', listing)

  # Business logic for determining if a listing is open
  # `due date` should be a datetime, to include precise hour of deadline
  Service.isOpen = (listing) ->
    return false unless listing && listing.Application_Due_Date
    now = moment()
    deadline = moment(listing.Application_Due_Date).tz('America/Los_Angeles')
    # listing is open if deadline is in the future
    return deadline > now

  Service.isReservedCommunity = (listing) ->
    !! listing.Reserved_community_type

  Service.isBMR = (listing) ->
    ['IH-RENTAL', 'IH-OWN'].indexOf(listing.Program_Type) >= 0

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingHelperService.$inject = ['ListingConstantsService']

angular
  .module('dahlia.services')
  .service('ListingHelperService', ListingHelperService)
