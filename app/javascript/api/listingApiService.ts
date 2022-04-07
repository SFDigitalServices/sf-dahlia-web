import { get } from "./apiService"
import RailsRentalListing from "./types/rails/listings/RailsRentalListing"
import { RailsListing } from "../modules/listings/SharedHelpers"
import { RailsListingPreference } from "./types/rails/listings/RailsListingPreferences"

type ListingsResponse = { listing: RailsRentalListing }
type ListingPreferencesResponse = { preferences: RailsListingPreference[] }

export const getListing = async (listingId?: string): Promise<RailsListing> =>
  get<ListingsResponse>(`/api/v1/listings/${listingId}.json`).then(({ data }) => data.listing)

/**
 * Get the lottery preferences for the given listing
 * @param {string} listingId
 * @returns {RailsListingPreference[]} list of preferences for the listing
 */
export const getPreferences = async (listingId?: string): Promise<RailsListingPreference[]> =>
  get<ListingPreferencesResponse>(`/api/v1/listings/${listingId}/preferences`).then(
    ({ data }) => data.preferences
  )
