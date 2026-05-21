import type BaseRailsUnitSummary from "./BaseRailsUnitSummary"

type RailsSaleUnitSummary = BaseRailsUnitSummary & {
  minPriceWithParking?: number
  minPriceWithoutParking?: number
  minHoaDuesWithParking?: number
  minHoaDuesWithoutParking?: number
  maxPriceWithParking?: number
  maxPriceWithoutParking?: number
  maxQualifyingAMI?: number
  maxHoaDuesWithParking?: number
  maxHoaDuesWithoutParking?: number
}

export default RailsSaleUnitSummary
