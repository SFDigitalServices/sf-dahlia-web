import { get } from "./apiService"
import RailsRentalListing from "./types/rails/listings/RailsRentalListing"

type ListingsResponse = { listings: RailsRentalListing[] }

export type EligibilityFilters = {
  household_size: string
  income_timeframe: string
  income_total: number
  include_children_under_6: boolean
  children_under_6: string
  type: string
}

export type QueryParams = { [key: string]: string | boolean | number }

const formatQueryString = (params: QueryParams) => {
  return Object.keys(params)
    .map((key) => {
      return encodeURIComponent(key) + "=" + encodeURIComponent(params[key])
    })
    .join("&")
}

export const getRentalListings = async (
  filters?: EligibilityFilters
): Promise<RailsRentalListing[]> => {
  const getIncomeLevel = () => {
    return filters.income_timeframe === "per_month"
      ? filters.income_total * 12
      : filters.income_total
  }

  const appliedFilters = {
    householdsize: filters.household_size ?? "",
    incomelevel: getIncomeLevel() ?? "",
    includeChildrenUnder6: filters.include_children_under_6 ?? false,
    childrenUnder6: filters.children_under_6 ?? "",
    listingsType: "rental",
  }

  return Object.keys(filters).length > 0
    ? get<ListingsResponse>(
        `/api/v1/listings/eligibility.json?${formatQueryString(appliedFilters)}`
      ).then(({ data }) => data.listings)
    : get<ListingsResponse>("/api/v1/listings.json?type=rental").then(({ data }) => data.listings)
}

export const getSaleListings = async (): Promise<RailsRentalListing[]> =>
  get<ListingsResponse>("/api/v1/listings.json?type=ownership").then(({ data }) => data.listings)
