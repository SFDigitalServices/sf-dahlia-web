import {
  UnitsSummarized,
  UnitSummary,
  MinMaxCurrency,
  MinMax,
} from "@bloom-housing/backend-core/types"

import RailsRentalListing from "../../types/rails/listings/RailsRentalListing"
import RailsRentalUnitSummary from "../../types/rails/listings/RailsRentalUnitSummary"
import { Adapter } from "../adapter"

// todo: implement with correct formatting
const asCurrencyString = (value: number): string => `$${value}`

const getMinMaxCurrency = (min: number, max: number): MinMaxCurrency => ({
  min: min != null && asCurrencyString(min),
  max: max != null && asCurrencyString(max),
})

const getMinMax = (min: number, max: number): MinMax => ({ min, max })

const UnitSummaryAdapter: Adapter<RailsRentalUnitSummary, UnitSummary> = (
  s: RailsRentalUnitSummary
) => ({
  unitType: s.unitType,
  minIncomeRange: getMinMaxCurrency(s.absoluteMinIncome, s.absoluteMaxIncome),
  occupancyRange: getMinMax(s.minOccupancy, s.maxOccupancy),
  rentAsPercentIncomeRange: getMinMax(s.minPercentIncome, s.maxPercentIncome),
  rentRange: getMinMaxCurrency(s.minMonthlyRent, s.maxMonthlyRent),
  totalAvailable: s.availability,
  areaRange: getMinMax(s.minSquareFt, s.maxSquareFt),
  floorRange: getMinMax(s.minSquareFt, s.maxSquareFt),
})

const UnitSummaryArrayAdapter: Adapter<RailsRentalUnitSummary[], UnitSummary[]> = (
  summaries?: RailsRentalUnitSummary[]
) => summaries?.map((summary) => UnitSummaryAdapter(summary)) ?? []

const UnitSummariesAdapter: Adapter<RailsRentalListing, UnitsSummarized> = (
  listing: RailsRentalListing
) => {
  const generalSummaries: UnitSummary[] = UnitSummaryArrayAdapter(listing.unitSummaries.general)
  const reservedSummaries: UnitSummary[] = UnitSummaryArrayAdapter(listing.unitSummaries.reserved)
  const allSummaries: UnitSummary[] = [...reservedSummaries, ...generalSummaries]

  return {
    unitTypes: allSummaries.map((summary) => summary.unitType),
    reservedTypes: reservedSummaries.map((summary) => summary.unitType),
    priorityTypes: listing.prioritiesDescriptor.map((priority) => priority.name),
    amiPercentages: [], // todo: populate this field
    byUnitType: allSummaries,
    byNonReservedUnitType: generalSummaries,
    byReservedType: [], // todo: populate this field
    byUnitTypeAndRent: [],
    byAMI: [], // todo: populate this field
    hmi: null, // todo: populate this field
  }
}

export default UnitSummariesAdapter
