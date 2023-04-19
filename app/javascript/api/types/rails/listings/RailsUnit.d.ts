import { ListingAttributes } from "./BaseRailsListing"

export type RailsUnit = {
  AMI_chart_type: string
  AMI_chart_year: number
  Availability: number
  BMR_Rent_Monthly?: number
  BMR_Rental_Minimum_Monthly_Income_Needed: number
  Id: string
  Listing?: string
  Max_AMI_for_Qualifying_Unit: number
  Max_Occupancy?: number
  Min_AMI_for_Qualifying_Unit?: number
  Min_Occupancy?: number
  Number_of_Bathrooms: number
  Property_Type?: string
  Status: string
  Unit_Type: string
  Unit_Floor: string
  Unit_Number: string
  Unit_Square_Footage: number
  attributes: ListingAttributes
  isReservedCommunity: boolean
  Price_Without_Parking?: number
  Price_With_Parking?: number
  HOA_Dues_Without_Parking?: number
  HOA_Dues_With_Parking?: number
  Priority_Type?: string
  occupancy?: number
  maxMonthlyIncomeNeeded?: number
  Rent_percent_of_income?: number
}

