import { get } from "./apiService"
import type RailsRentalListing from "./types/rails/listings/RailsRentalListing"
import type { RailsListing } from "../modules/listings/SharedHelpers"
import type { RailsListingPreference } from "./types/rails/listings/RailsListingPreferences"
import type RailsUnit from "./types/rails/listings/RailsUnit"
import type { RailsLotteryResult } from "./types/rails/listings/RailsLotteryResult"
import type { RailsAmiChart, RailsAmiChartMetaData } from "./types/rails/listings/RailsAmiChart"
import {
  listing,
  listingPreferences,
  listingUnits,
  lotteryBuckets,
  lotteryRanking,
  amiCharts,
} from "./apiEndpoints"

type ListingsResponse = { listing: RailsRentalListing }
type ListingPreferencesResponse = { preferences: RailsListingPreference[] }
type ListingUnitsResponse = { units: RailsUnit[] }
type ListingAmiChartsResponse = { ami: RailsAmiChart[] }

const forceRecache = () => (window.location.search.includes("preview=true") ? { force: true } : {})

export const getListing = async (listingId?: string): Promise<RailsListing> => {
  const httpConfig = { params: {} }
  httpConfig.params = forceRecache()
  return get<ListingsResponse>(listing(listingId), httpConfig).then(({ data }) => data.listing)
}

/**
 * Get the lottery buckets with rankings for the given listing
 * @param {string} listingId
 * @returns {RailsLotteryResult} lottery result info
 */
export const getLotteryBucketDetails = async (listingId: string): Promise<RailsLotteryResult> => {
  const httpConfig = { params: {} }
  httpConfig.params = forceRecache
  return get<RailsLotteryResult>(lotteryBuckets(listingId), httpConfig).then(
    (response) => response.data
  )
}

// TODO: remove this function and calls to it once getLotteryBucketDetails has been fixed
/**
 * Get the lottery buckets with rankings for the given listing, this is a workaround for slow performance on larger Lottery API payloads
 * We don't actually need the preferenceResults data that the lotteryBuckets endpoint provides
 * @param {string} listingId
 * @returns {RailsLotteryResult} lottery result info
 */
export const getLotteryBucketDetailsWorkaround = async (
  listingId: string
): Promise<RailsLotteryResult> =>
  get<RailsLotteryResult>(lotteryRanking(listingId, "000000000")).then((response) => response.data)

/**
 * Get the lottery ranking info for a given listing id and lottery number
 *
 * @param {string} listingId
 * @param {string} lotteryId
 * @returns {RailsLotteryResult} lottery result info. null if there is an error
 */
export const getLotteryResults = async (
  listingId: string,
  lotteryId: string
): Promise<RailsLotteryResult> =>
  get<RailsLotteryResult>(lotteryRanking(listingId, lotteryId))
    .then((response) => response.data)
    .catch(() => {
      return null
    })

/**
 * Get the lottery preferences for the given listing
 * @param {string} listingId
 * @returns {RailsListingPreference[]} list of preferences for the listing
 */
export const getPreferences = async (listingId: string): Promise<RailsListingPreference[]> => {
  const httpConfig = { params: {} }
  httpConfig.params = forceRecache()
  return get<ListingPreferencesResponse>(listingPreferences(listingId), httpConfig).then(
    ({ data }) => data.preferences
  )
}
/**
 * Get the unit details for the given listing
 * @param {string} listingId
 * @returns {RailsListingUnits[]} list of Unitss for the listing
 */
export const getUnits = async (listingId: string): Promise<RailsUnit[]> => {
  const httpConfig = { params: {} }
  httpConfig.params = { force: forceRecache() }
  return get<ListingUnitsResponse>(listingUnits(listingId), httpConfig).then(
    ({ data }) => data.units
  )
}

/**
 * Get the ami charts for the given listing in a given year in a given set of ami percentages
 * @param {string} listingId, percentages, year
 * @returns {RailsAmiChart[]} list of Units for the listing
 */
export const getAmiCharts = async (
  chartsToFetch: RailsAmiChartMetaData[]
): Promise<RailsAmiChart[]> => {
  const queryParams = chartsToFetch.reduce((queryParam, amiChart) => {
    // eslint-disable-next-line unicorn/prefer-spread
    return queryParam.concat(
      `year[]=${amiChart.year}&percent[]=${amiChart.percent}&chartType[]=${amiChart.type}&`
    )
  }, "")

  return get<ListingAmiChartsResponse>(amiCharts(queryParams)).then(({ data }) => {
    return data.ami
  })
}
