import RailsListingDescriptor from "./RailsListingDescriptor"

export type ListingEvent = {
  City?: string
  Date?: string
  End_Time?: string
  Id?: string
  Listing?: string
  Start_Time?: string
  Street_Address?: string
  Venue?: string
  attributes?: { type: string; url: string }
}

export type ListingLotteryPreference = {
  Available_Units?: number
  Current_Units_Available?: number
  Id: string
  Listing: string
  Lottery_Preference: { Name: string; Id: string; attributes: { type: string; url: string } }
  Order: number
  Total_Submitted_Apps: number
}

type BaseRailsListing = {
  Accessibility?: string
  Application_Due_Date: string
  Amenities?: string
  Building_City?: string
  Building_Name: string
  Building_Selection_Criteria?: string
  Building_State?: string
  Building_Street_Address?: string
  Building_URL?: string
  Building_Zip_Code?: string
  Costs_Not_Included?: string
  Credit_Rating?: string
  Deposit_Min?: number
  Deposit_Max?: number
  Developer?: string
  Does_Match?: boolean
  Eviction_History?: string
  Fee?: number
  Id: string
  Information_Sessions: ListingEvent[]
  Legal_Disclaimers?: string
  Listing_Lottery_Preferences?: ListingLotteryPreference[]
  LotteryResultsURL?: string
  Lottery_City?: string
  Lottery_Date?: string
  Lottery_Results_Date?: string
  Lottery_Status?: string
  Lottery_Street_Address?: string
  Lottery_Venue?: string
  Maximum_waitlist_size?: number
  Name: string
  Neighborhood?: string
  Open_Houses: ListingEvent[]
  Parking_Information?: string
  Pet_Policy?: string
  Publish_Lottery_Results: boolean
  RecordTypeId: string
  Reserved_community_minimum_age: number
  Reserved_community_type?: string
  Required_Documents?: string
  Smoking_Policy?: string
  Tenure: string
  Total_waitlist_openings?: number
  Units_Available: number
  chartTypes?: unknown
  current_waitlist_size?: number
  hasWaitlist: boolean
  imageURL?: string
  listingID: string
  prioritiesDescriptor?: Array<RailsListingDescriptor>
  reservedDescriptor?: Array<RailsListingDescriptor>
  Year_Built?: number
}

export default BaseRailsListing
