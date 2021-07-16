import { Listing } from "@bloom-housing/backend-core/types"

import { ListAdapter } from "./adapters/adapter"
import RentalListingAdapter from "./adapters/listing/RentalListingAdapter"
import { get } from "./apiService"
import RailsRentalListing from "./types/rails/listings/RailsRentalListing"

type ListingsResponse = { listings: RailsRentalListing[] }
type ListingResponse = RailsRentalListing

export const getRentalListings = async (): Promise<Listing[]> =>
  get<ListingsResponse>("/api/v1/listings.json?type=rental")
    .then(({ data }) => data.listings)
    .then(ListAdapter(RentalListingAdapter))

/**
 * example for single object
 * TODO: delete this?
 */
export const getListing = async (id: string): Promise<Listing> =>
  get<ListingResponse>(`/api/v1/listings/${id}`).then(({ data }) => RentalListingAdapter(data))
