############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingLotteryService = ($http, ListingIdentityService, ModalService) ->
  Service = {}
  Service.lotteryBucketInfo = {}
  Service.lotteryRankingInfo = {}
  Service.loading = {}
  Service.error = {}

  Service.getLotteryBuckets = (listing) ->
    return unless listing
    angular.copy({}, Service.lotteryBucketInfo)
    Service.loading.lotteryResults = true
    $http.get("/api/v1/listings/#{listing.Id}/lottery_buckets").success((data, status, headers, config) ->
      Service.loading.lotteryResults = false
      Service.lotteryBucketInfo[listing.Id] = {}
      angular.copy(data, Service.lotteryBucketInfo[listing.Id])
    ).error( (data, status, headers, config) ->
      Service.loading.lotteryResults = false
      return
    )

  Service.listingHasLotteryBuckets = (listing) ->
    return false unless listing
    listingLotteryBucketInfo = Service.lotteryBucketInfo[listing.Id]
    if listingLotteryBucketInfo
      _.some(listingLotteryBucketInfo.lotteryBuckets, (bucket) -> !_.isEmpty(bucket.preferenceResults))
    else
      false

  Service.lotteryDatePassed = (listing) ->
    return true if ListingIdentityService.isFirstComeFirstServe(listing) && !ListingIdentityService.isOpen(listing)
    return false unless listing.Lottery_Date
    today = moment().tz('America/Los_Angeles').startOf('day')
    lotteryDate = moment(listing.Lottery_Date).tz('America/Los_Angeles')
    # listing is open if deadline is in the future
    return today > lotteryDate

  Service.lotteryIsUpcoming = (listing) ->
    return false unless listing
    !listing.Lottery_Results && !Service.lotteryDatePassed(listing) && !Service.lotteryComplete(listing)

  # Lottery Results being "available" means we have a PDF URL or lotteryBuckets
  Service.listingHasLotteryResults = (listing) ->
    return false unless listing
    !! (listing.LotteryResultsURL || Service.listingHasLotteryBuckets(listing))

  Service.lotteryComplete = (listing) ->
    listing && (listing.Lottery_Status == 'Lottery Complete')

  Service.openLotteryResultsModal = ->
    Service.loading.lotteryRank = false
    Service.error.lotteryRank = false
    ModalService.openModal('listings/templates/listing/_lottery_modal.html', 'modal-small')

  Service.formatLotteryNumber = (lotteryNumber) ->
    lotteryNumber = lotteryNumber.replace(/[^0-9]+/g, '')
    return '' if lotteryNumber.length == 0
    if (lotteryNumber.length < 8)
      lotteryNumber = _.repeat('0', 8 - lotteryNumber.length) + lotteryNumber
    lotteryNumber

  Service.getLotteryRanking = (lotteryNumber, listing) ->
    return false unless lotteryNumber && listing
    Service.lotteryRankingInfo[listing.Id] = {}
    angular.copy({submitted: false}, Service.lotteryRankingInfo[listing.Id])
    params =
      params:
        lottery_number: lotteryNumber
    Service.loading.lotteryRank = true
    Service.error.lotteryRank = false
    $http.get("/api/v1/listings/#{listing.Id}/lottery_ranking", params).success((data, status, headers, config) ->
      angular.copy(data, Service.lotteryRankingInfo[listing.Id])
      Service.loading.lotteryRank = false
      Service.lotteryRankingInfo[listing.Id].submitted = true
    ).error( (data, status, headers, config) ->
      Service.loading.lotteryRank = false
      Service.error.lotteryRank = true
    )

  Service.resetData = ->
    angular.copy({}, Service.lotteryBucketInfo)

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingLotteryService.$inject = ['$http', 'ListingIdentityService', 'ModalService']

angular
  .module('dahlia.services')
  .service('ListingLotteryService', ListingLotteryService)
