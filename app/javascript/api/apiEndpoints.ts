export const listing = (listingId) => `/api/v1/listings/${listingId}.json`
export const listings = (listingType: "rental" | "ownership") =>
  `/api/v1/listings.json?type=${listingType}&subset=browse`
export const listingsWithFilters = (queryParams: string) =>
  `/api/v1/listings/eligibility.json?${queryParams}`
export const listingPreferences = (listingId) => `/api/v1/listings/${listingId}/preferences`
export const listingUnits = (listingId) => `/api/v1/listings/${listingId}/units`
export const lotteryBuckets = (listingId) => `/api/v1/listings/${listingId}/lottery_buckets`
export const lotteryRanking = (listingId, lotteryId) =>
  `/api/v1/listings/${listingId}/lottery_ranking?lottery_number=${lotteryId}`
export const amiCharts = (queryParams: string) => `/api/v1/listings/ami.json?${queryParams}`
export const listingsMapData = `/api/v1/listings/map_data.json`
