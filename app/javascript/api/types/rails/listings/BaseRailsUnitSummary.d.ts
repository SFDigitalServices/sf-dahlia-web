interface BaseRailsUnitSummary {
  absoluteMaxIncome: number
  absoluteMinIncome: number
  availability: number
  listingID: string
  maxMonthlyRent: number
  maxOccupancy: number
  maxPercentIncome?: number
  maxRentalMinIncome: number
  maxSquareFt?: number
  minMonthlyRent: number
  minOccupancy: number
  minPercentIncome?: number
  minPriceWithParking?: number
  minPriceWithoutParking?: number
  minRentalMinIncome: number
  minSquareFt?: number
  totalUnits: number
  unitType: string
}

export default BaseRailsUnitSummary
