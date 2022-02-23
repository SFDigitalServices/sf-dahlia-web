import { get } from "./apiService"
import RailsRentalListing from "./types/rails/listings/RailsRentalListing"

type ListingsResponse = { listings: RailsRentalListing[] }

export const getListing = async (listingId?: string): Promise<ListingsResponse> =>
  get<ListingsResponse>(`/api/v1/listings/#${listingId}.json`).then(({ data }) => data)
