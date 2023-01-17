export type RailsListingUnits = {
  AMI_chart_type: string
  AMI_chart_year: number
  Availability: number
  BMR_Rental_Minimum_Monthly_Income_Needed: number
  HOA_Dues_Without_Parking?: number
  Id: string
  Max_AMI_for_Qualifying_Unit?: number
  Min_AMI_for_Qualifying_Unit?: number
  Min_Occupancy: number
  Number_of_Bathrooms: number
  Price_Without_Parking?: number
  Priority_Type?: string
  Property_Type: string
  Status: string
  Unit_Floor: string
  Unit_Number: string
  Unit_Square_Footage: number
  Unit_Type: string
  attributes: { type: string; url: string }
  isReservedCommunity: boolean
}
