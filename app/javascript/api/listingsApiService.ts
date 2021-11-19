import { get } from "./apiService"
import RailsRentalListing from "./types/rails/listings/RailsRentalListing"

type ListingsResponse = { listings: RailsRentalListing[] }

export const getRentalListings = async (): Promise<RailsRentalListing[]> =>
  get<ListingsResponse>("/api/v1/listings.json?type=rental").then(({ data }) => data.listings)

export const getSaleListings = async (): Promise<RailsRentalListing[]> =>
  get<ListingsResponse>("/api/v1/listings.json?type=ownership").then(({ data }) => data.listings)
