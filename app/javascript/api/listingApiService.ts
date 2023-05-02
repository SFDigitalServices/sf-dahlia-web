import { get } from "./apiService"
import RailsRentalListing from "./types/rails/listings/RailsRentalListing"
import { RailsListing } from "../modules/listings/SharedHelpers"
import { RailsListingPreference } from "./types/rails/listings/RailsListingPreferences"
import RailsUnit from "./types/rails/listings/RailsUnit"
import { RailsLotteryResult } from "./types/rails/listings/RailsLotteryResult"
import { RailsAmiChart, RailsAmiChartMetaData } from "./types/rails/listings/RailsAmiChart"
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

export const getListing = async (listingId?: string): Promise<RailsListing> =>
  get<ListingsResponse>(listing(listingId)).then(({ data }) => data.listing)

/**
 * Get the lottery buckets with rankings for the given listing
 * @param {string} listingId
 * @returns {RailsLotteryResult} lottery result info
 */
export const getLotteryBucketDetails = async (listingId: string): Promise<RailsLotteryResult> =>
  get<RailsLotteryResult>(lotteryBuckets(listingId)).then((response) => response.data)

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
export const getPreferences = async (listingId: string): Promise<RailsListingPreference[]> =>
  get<ListingPreferencesResponse>(listingPreferences(listingId)).then(
    ({ data }) => data.preferences
  )

/**
 * Get the unit details for the given listing
 * @param {string} listingId
 * @returns {RailsListingUnits[]} list of Unitss for the listing
 */
export const getUnits = async (listingId: string): Promise<RailsUnit[]> =>
  get<ListingUnitsResponse>(listingUnits(listingId)).then(({ data }) => data.units)

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
