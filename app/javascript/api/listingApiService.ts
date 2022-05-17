import { get } from "./apiService"
import RailsRentalListing from "./types/rails/listings/RailsRentalListing"
import { RailsListing } from "../modules/listings/SharedHelpers"
import { RailsListingPreference } from "./types/rails/listings/RailsListingPreferences"
import { RailsLotteryBucketsDetails } from "./types/rails/listings/RailsLotteryBucketsDetails"
import { RailsLotteryRanking } from "./types/rails/listings/RailsLotteryRanking"

type ListingsResponse = { listing: RailsRentalListing }
type ListingPreferencesResponse = { preferences: RailsListingPreference[] }

export const getListing = async (listingId?: string): Promise<RailsListing> =>
  get<ListingsResponse>(`/api/v1/listings/${listingId}.json`).then(({ data }) => data.listing)

/**
 * Get the lottery buckets with rankings for the given listing
 * @param {string} listingId
 * @returns {RailsLotteryBuckets} lottery bucket info
 */
export const getLotteryBucketDetails = async (
  listingId: string
): Promise<RailsLotteryBucketsDetails> =>
  get<RailsLotteryBucketsDetails>(`/api/v1/listings/${listingId}/lottery_buckets`).then(
    (response) => response.data
  )

/**
 * Get the lottery ranking info for a given listing id and lottery number
 *
 * @param {string} listingId
 * @param {string} lotteryId
 * @returns {RailsLotteryRanking} lottery ranking info. null if there is an error
 */
export const getLotteryResults = async (
  listingId: string,
  lotteryId: string
): Promise<RailsLotteryRanking> =>
  get<RailsLotteryRanking>(
    `/api/v1/listings/${listingId}/lottery_ranking?lottery_number=${lotteryId}`
  )
    .then((response) => response.data)
    .catch(() => {
      // intentionally returning null for now. will consider adding a component level
      // error boundary in a future story
      return null
    })

/**
 * Get the lottery preferences for the given listing
 * @param {string} listingId
 * @returns {RailsListingPreference[]} list of preferences for the listing
 */
export const getPreferences = async (listingId: string): Promise<RailsListingPreference[]> =>
  get<ListingPreferencesResponse>(`/api/v1/listings/${listingId}/preferences`).then(
    ({ data }) => data.preferences
  )
