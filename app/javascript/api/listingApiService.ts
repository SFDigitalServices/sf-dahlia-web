import { get } from "./apiService"
import RailsRentalListing from "./types/rails/listings/RailsRentalListing"

type ListingsResponse = { listing: RailsRentalListing }

export const getListing = async (listingId?: string): Promise<RailsRentalListing> =>
  get<ListingsResponse>(`/api/v1/listings/${listingId}.json`).then(({ data }) => data.listing)
