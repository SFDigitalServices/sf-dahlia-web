############################################################################################
####################################### SERVICE ############################################
############################################################################################

ListingLotteryService = ($http) ->
  Service = {}
  Service.lotteryBucketInfo = {}
  Service.lotteryRankingInfo = {}
  Service.loading = {}

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

  Service.resetData = ->
    angular.copy({}, Service.lotteryBucketInfo)

  return Service

############################################################################################
######################################## CONFIG ############################################
############################################################################################

ListingLotteryService.$inject = ['$http']

angular
  .module('dahlia.services')
  .service('ListingLotteryService', ListingLotteryService)
