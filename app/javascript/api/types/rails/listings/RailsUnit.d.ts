import { ListingAttributes } from "./BaseRailsListing"

type RailsUnit = {
  AMI_chart_type: string
  AMI_chart_year: number
  BMR_Rent_Monthly?: number
  BMR_Rental_Minimum_Monthly_Income_Needed: number
  Id: string
  Listing: string
  Max_AMI_for_Qualifying_Unit: number
  Min_AMI_for_Qualifying_Unit?: number
  Property_Type?: string
  Status: string
  Unit_Type: string
  attributes: ListingAttributes
  isReservedCommunity: boolean
  Price_Without_Parking?: number
  Price_With_Parking?: number
  HOA_Dues_Without_Parking?: number
  HOA_Dues_With_Parking?: number
  Priority_Type?: string
}

export default RailsUnit
