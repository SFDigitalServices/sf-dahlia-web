import type { ListingAttributes } from "./BaseRailsListing"

type RailsUnit = {
  AMI_chart_type: string
  AMI_chart_year: number
  Availability?: number
  BMR_Rent_Monthly?: number
  BMR_Rental_Minimum_Monthly_Income_Needed: number
  Id: string
  Listing?: string
  Max_AMI_for_Qualifying_Unit: number
  Max_Occupancy?: number
  Min_AMI_for_Qualifying_Unit?: number
  Min_Occupancy?: number
  Number_of_Bathrooms?: number
  Property_Type?: string
  Status: string
  Unit_Type: string
  Unit_Floor?: string
  Unit_Number?: string
  Unit_Square_Footage?: number
  attributes: ListingAttributes
  isReservedCommunity: boolean
  Price_Without_Parking?: any
  Price_With_Parking?: any
  HOA_Dues_Without_Parking?: any
  HOA_Dues_With_Parking?: any
  Priority_Type?: string
  Rent_percent_of_income?: number
}

export interface RailsUnitWithOccupancy extends RailsUnit {
  occupancy: number
}

export interface RailsUnitWithOccupancyAndMinMaxIncome extends RailsUnitWithOccupancy {
  maxMonthlyIncomeNeeded: number
  minMonthlyIncomeNeeded: number
}

export default RailsUnit
