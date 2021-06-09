import { Listing } from "@bloom-housing/backend-core/types"

import RentalListingAdapter from "./adapters/listing/RentalListingAdapter"
import { get } from "./apiService"
import RailsRentalListing from "./types/rails/listings/RailsRentalListing"

type ListingsResponse = {
  listings: Array<RailsRentalListing>
}

export const getRentalListings = async (): Promise<Array<Listing>> =>
  get<ListingsResponse>("/api/v1/listings.json?type=rental").then(({ data: { listings } }) =>
    listings.map((listing) => RentalListingAdapter(listing))
  )
