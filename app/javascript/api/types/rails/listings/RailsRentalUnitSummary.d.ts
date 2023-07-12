import type BaseRailsUnitSummary from "./BaseRailsUnitSummary"

type RailsRentalUnitSummary = BaseRailsUnitSummary & {
  maxHoaDuesWithParking?: number
  maxHoaDuesWithoutParking?: number
  maxPriceWithParking?: number
  maxPriceWithoutParking?: number
  minHoaDuesWithParking?: number
  minHoaDuesWithoutParking?: number
}

export default RailsRentalUnitSummary
