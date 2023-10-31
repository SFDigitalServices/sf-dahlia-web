export const listing = (listingId, preview = false) =>
  `/api/v1/listings/${listingId}.json?force=${preview ? "true" : "false"}`
export const listingPreferences = (listingId) => `/api/v1/listings/${listingId}/preferences`
export const listingUnits = (listingId) => `/api/v1/listings/${listingId}/units`
export const lotteryBuckets = (listingId) => `/api/v1/listings/${listingId}/lottery_buckets`
export const lotteryRanking = (listingId, lotteryId) =>
  `/api/v1/listings/${listingId}/lottery_ranking?lottery_number=${lotteryId}`
export const amiCharts = (queryParams: string) => `/api/v1/listings/ami.json?${queryParams}`
