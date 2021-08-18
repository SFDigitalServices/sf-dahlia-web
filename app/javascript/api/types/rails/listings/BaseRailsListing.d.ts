import RailsListingDescriptor from "./RailsListingDescriptor"

type BaseRailsListing = {
  reservedDescriptor?: Array<RailsListingDescriptor>
  prioritiesDescriptor?: Array<RailsListingDescriptor>
  listingID: string
  chartTypes?: unknown
  Id: string
  Tenure: string
  Name: string
  Application_Due_Date: string
  Lottery_Results_Date: string
  Reserved_community_minimum_age: number
  Reserved_community_type: string
  hasWaitlist: boolean
  Units_Available: number
  Building_URL?: string
  Building_Name: string
  Building_City?: string
  Building_State?: string
  Building_Street_Address?: string
  Building_Zip_Code?: string
  Publish_Lottery_Results: boolean
  Lottery_Status: string
  RecordTypeId: string
  imageURL?: string
}

export default BaseRailsListing
