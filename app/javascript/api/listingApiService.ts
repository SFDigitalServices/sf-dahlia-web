import { get } from "./apiService"
import RailsRentalListing from "./types/rails/listings/RailsRentalListing"
import { RailsListing } from "../modules/listings/SharedHelpers"

type ListingsResponse = { listing: RailsRentalListing }

export const getListing = async (listingId?: string): Promise<RailsListing> =>
  get<ListingsResponse>(`/api/v1/listings/${listingId}.json`).then(({ data }) => data.listing)
