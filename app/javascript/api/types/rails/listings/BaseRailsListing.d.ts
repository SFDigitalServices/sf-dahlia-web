import type RailsListingDescriptor from "./RailsListingDescriptor"
import { RailsTranslations } from "./RailsTranslation"
import type RailsUnit from "./RailsUnit"

type ListingBuilding = {
  attributes: ListingAttributes
  Id: string
  Number_of_Parking_Spaces?: number
  Parking_Cost?: number
}

type RecordType = {
  attributes: ListingAttributes
  Id: string
  Name: string
}

export type ListingAttributes = {
  type: string
  url: string
}

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

export type ImageItem = {
  displayImageURL: string
  attributes?: { type: string; url: string }
  Listing?: string
  Id?: string
  Name?: string
  Image_URL?: string
  Image_Description?: string
}

export type ListingLotteryPreference = {
  Available_Units?: number
  Current_Units_Available?: number
  Id: string
  Listing: string
  Lottery_Preference: { Name: string; Id: string; attributes: { type: string; url: string } }
  Order: number
  Total_Submitted_Apps: number
  attributes: ListingAttributes
  PDF_URL?: string
}

export type ListingOnlineDetail = {
  Id: string
  Listing_Online_Detail_Name: string
  URL: string
}

type BaseRailsListing = {
  Accepting_Online_Applications: boolean
  Accepting_applications_at_leasing_agent: boolean
  Accepting_applications_by_PO_Box: boolean
  Accessibility?: string
  Allows_Realtor_Commission?: boolean
  Amenities?: string
  Appliances?: string
  Application_City?: string
  Application_Due_Date: string
  Application_Start_Date_Time?: string
  Application_Organization?: string
  Application_Phone?: string
  Application_Postal_Code?: string
  Application_State?: string
  Application_Street_Address?: string
  Blank_paper_application_can_be_picked_up: boolean
  Building: ListingBuilding
  Building_City?: string
  Building_Name: string
  Building_Selection_Criteria?: string
  Building_State?: string
  Building_Street_Address?: string
  Building_URL?: string
  Building_Zip_Code?: string
  CC_and_R_URL?: string
  Costs_Not_Included?: string
  Credit_Rating?: string
  Criminal_History?: string
  Custom_Listing_Type?: string
  Deposit_Max?: number
  Deposit_Min?: number
  Developer?: string
  Does_Match?: boolean
  Expected_Move_in_Date?: string
  Eviction_History?: string
  Fee?: number
  First_Come_First_Served: boolean
  Id: string
  In_Lottery: number
  Information_Sessions?: ListingEvent[]
  LastModifiedDate: string
  Leasing_Agent_City?: string
  Leasing_Agent_Email?: string
  Leasing_Agent_Name?: string
  Leasing_Agent_Phone?: string
  Leasing_Agent_State?: string
  Leasing_Agent_Street?: string
  Leasing_Agent_Title?: string
  Leasing_Agent_Zip?: string
  Legal_Disclaimers?: string
  Listing_Type?: string
  Listing_Lottery_Preferences?: ListingLotteryPreference[]
  Listing_Other_Notes?: string
  Listing_Online_Details?: ListingOnlineDetail[]
  LotteryResultsURL?: string
  Lottery_City?: string
  Lottery_Date?: string
  Lottery_Results_Date?: string
  Lottery_Summary?: string
  Lottery_Status?: string
  Lottery_Street_Address?: string
  Lottery_Venue?: string
  Lottery_Winners: number
  Marketing_URL: string
  Maximum_waitlist_size?: number
  Multiple_Listing_Service_URL?: string
  Name: string
  Neighborhood?: string
  Number_of_people_currently_on_waitlist?: number
  Office_Hours?: string
  Open_Houses?: ListingEvent[]
  Parking_Information?: string
  Pet_Policy?: string
  Pricing_Matrix?: string
  Program_Type: string
  Project_ID: string
  Publish_Lottery_Results_on_DAHLIA?: string
  Realtor_Commission_Amount?: number
  Realtor_Commission_Info?: string
  Realtor_Commission_Unit?: string
  RecordType: RecordType
  RecordTypeId: string
  Repricing_Mechanism?: string
  Required_Documents?: string
  Reserved_community_maximum_age: number
  Reserved_community_minimum_age: number
  Reserved_Community_Requirement?: string
  Reserved_community_type?: string
  Reserved_community_type_Description?: string
  SASE_Required_for_Lottery_Ticket: boolean
  Services_Onsite?: string
  Smoking_Policy?: string
  // TODO: DAH-2846
  // We don't yet get Status back for a listing
  // Salesforce will add it to the API response
  // for now, it will always return null
  Status?: string
  Tenure: string
  Total_number_of_building_units: number
  Total_waitlist_openings?: number
  Utilities?: string
  Units: Array<RailsUnit>
  Units_Available: number
  Year_Built?: number
  attributes: ListingAttributes
  chartTypes?: unknown
  current_waitlist_size?: number
  hasWaitlist: boolean
  Listing_Images: ImageItem[]
  imageURL?: string
  listingID: string
  nGeneral_Application_Total: number
  prioritiesDescriptor?: Array<RailsListingDescriptor>
  reservedDescriptor?: Array<RailsListingDescriptor>
  translations?: RailsTranslations
}

export default BaseRailsListing
