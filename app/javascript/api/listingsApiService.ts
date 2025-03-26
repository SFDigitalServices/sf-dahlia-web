import { get } from "./apiService"
import type RailsRentalListing from "./types/rails/listings/RailsRentalListing"
import { listings, listingsWithFilters, listingsMapData } from "./apiEndpoints"
import { forceRecacheParam } from "../util/listingUtil"

type ListingsResponse = { listings: RailsRentalListing[] }

export type ListingMapData = {
  listingId: string
  location: { lat: number; lng: number }
  section: string
  selected?: boolean
  hidden?: boolean
}

export type ListingsMapDataResponse = { listings_map_data: ListingMapData[] }

export type EligibilityFilters = {
  household_size: string
  income_timeframe: string
  income_total: number
  include_children_under_6: boolean
  children_under_6: string
  type: string
}

export type QueryParams = { [key: string]: string | boolean | number }

type ListingsType = "rental" | "ownership"

export const formatQueryString = (params: QueryParams) => {
  return Object.keys(params)
    .map((key) => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
    })
    .join("&")
}

export const getEligibilityQueryString = (
  filters: EligibilityFilters,
  listingsType: ListingsType
) => {
  const getIncomeLevel = () => {
    return filters?.income_timeframe === "per_month"
      ? filters.income_total * 12
      : filters?.income_total
  }

  const appliedFilters = {
    householdsize: filters?.household_size ?? "",
    incomelevel: getIncomeLevel() ?? "",
    includeChildrenUnder6: filters?.include_children_under_6 ?? false,
    childrenUnder6: filters?.children_under_6 ?? "",
    listingsType: listingsType,
  }
  return formatQueryString(appliedFilters)
}

export const getListings = async (
  listingType: ListingsType,
  filters?: EligibilityFilters
): Promise<RailsRentalListing[]> =>
  filters && Object.keys(filters).length > 0
    ? get<ListingsResponse>(
        listingsWithFilters(getEligibilityQueryString(filters, listingType)),
        forceRecacheParam()
      ).then(({ data }) => data.listings)
    : get<ListingsResponse>(listings(listingType), forceRecacheParam()).then(
        ({ data }) => data.listings
      )

export const getRentalListings = async (
  filters?: EligibilityFilters
): Promise<RailsRentalListing[]> => getListings("rental", filters)

export const getSaleListings = async (
  filters?: EligibilityFilters
): Promise<RailsRentalListing[]> => getListings("ownership", filters)

export const getListingsMapData = async () =>
  get<ListingsMapDataResponse>(listingsMapData).then(({ data }) => data.listings_map_data)
