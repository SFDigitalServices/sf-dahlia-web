import BaseRailsUnitSummary from "./BaseRailsUnitSummary"

type RailsRentalUnitSummary = BaseRailsUnitSummary & {
  minRentalMinIncome: number
  minPercentIncome?: number
  maxRentalMinIncome: number
  maxPercentIncome?: number
  maxMonthlyRent: number
  minMonthlyRent: number
  absoluteMinIncome: number
  absoluteMaxIncome: number
}

export default RailsRentalUnitSummary
