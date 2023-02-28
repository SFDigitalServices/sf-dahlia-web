import { get } from "./apiService"
import RailsRentalListing from "./types/rails/listings/RailsRentalListing"
import { RailsListing } from "../modules/listings/SharedHelpers"
import { RailsListingPreference } from "./types/rails/listings/RailsListingPreferences"
import { RailsListingUnits } from "./types/rails/listings/RailsListingUnits"
import { RailsLotteryResult } from "./types/rails/listings/RailsLotteryResult"
import {
  listing,
  listingPreferences,
  listingUnits,
  lotteryBuckets,
  lotteryRanking,
} from "./apiEndpoints"

type ListingsResponse = { listing: RailsRentalListing }
type ListingPreferencesResponse = { preferences: RailsListingPreference[] }
type ListingUnitsResponse = { units: RailsListingUnits[] }

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
export const getUnits = async (listingId: string): Promise<RailsListingUnits[]> =>
  get<ListingUnitsResponse>(listingUnits(listingId)).then(({ data }) => data.units)
