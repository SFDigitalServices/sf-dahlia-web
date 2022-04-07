import { ListingAttributes } from "./BaseRailsListing"

type RailsUnit = {
  AMI_chart_type: string
  AMI_chart_year: number
  BMR_Rent_Monthly: number
  BMR_Rental_Minimum_Monthly_Income_Needed: number
  Id: string
  Listing: string
  Max_AMI_for_Qualifying_Unit: number
  Status: string
  Unit_Type: string
  attributes: ListingAttributes
  isReservedCommunity: boolean
}

export default RailsUnit
