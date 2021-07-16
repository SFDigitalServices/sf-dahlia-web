interface BaseRailsUnitSummary {
  unitType: string
  totalUnits: number
  minSquareFt?: number
  minOccupancy: number
  maxSquareFt?: number
  maxOccupancy: number
  listingID: string
  availability: number
}

export default BaseRailsUnitSummary
