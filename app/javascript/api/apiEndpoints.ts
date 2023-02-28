export const listing = (listingId) => `/api/v1/listings/${listingId}.json`
export const listingPreferences = (listingId) => `/api/v1/listings/${listingId}/preferences`
export const listingUnits = (listingId) => `/api/v1/listings/${listingId}/units`
export const lotteryBuckets = (listingId) => `/api/v1/listings/${listingId}/lottery_buckets`
export const lotteryRanking = (listingId, lotteryId) =>
  `/api/v1/listings/${listingId}/lottery_ranking?lottery_number=${lotteryId}`
