import {
  Listing,
  ListingEventType,
  ListingStatus,
  CSVFormattingType,
  CountyCode,
  EnumListingReviewOrderType,
} from "@bloom-housing/backend-core/types"

import RailsRentalListing from "../../types/rails/listings/RailsRentalListing"
import { Adapter } from "../adapter"
import ListingAddressAdapter from "./ListingAddressAdapter"
import ListingPropertyAdapter from "./ListingPropertyAdapter"
import UnitSummariesAdapter from "./UnitSummariesAdapter"

const toDate = (s: string): Date => new Date(s) // todo: handle different formats, actually implement this properly

const ListingAdapter: Adapter<RailsRentalListing, Listing> = (item: RailsRentalListing) => ({
  status:
    toDate(item.Application_Due_Date) > new Date() ? ListingStatus.active : ListingStatus.closed,
  urlSlug: "", // todo: populate this field
  displayWaitlistSize: false,
  CSVFormattingType: CSVFormattingType.basic,
  countyCode: CountyCode.Alameda, // todo: Add san francisco county to Bloom's enum
  showWaitlist: item.hasWaitlist,
  preferences: [],
  property: ListingPropertyAdapter(item),
  applicationAddress: null,
  applicationPickUpAddress: null,
  leasingAgentAddress: null,
  leasingAgents: null,
  id: item.listingID,
  createdAt: null, // todo: update this field
  updatedAt: null, // todo: update this field
  applicationMethods: [],
  assets: [
    {
      id: "",
      createdAt: null,
      updatedAt: null,
      label: "building",
      fileId: item.imageURL,
    },
  ],
  events: [
    // TODO: Solve how to clearly communicate about lotteries. This is a temporary solution to be able to display lottery results data on
    // the listing directory page, but the lottery results date is not the same as the lottery start date.
    item.Lottery_Results_Date && {
      type: ListingEventType.lotteryResults,
      startTime: toDate(item.Lottery_Results_Date),
      // TODO: To temporarily differentiate upcoming from complete I'm adding endTime to completed listings
      endTime:
        item.Lottery_Status === "Lottery Complete" ? toDate(item.Lottery_Results_Date) : null,
      id: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  applicationDueDate: toDate(item.Application_Due_Date),
  applicationOpenDate: null, // todo: update this field
  applicationFee: null,
  applicationOrganization: null,
  applicationPickUpAddressOfficeHours: null,
  buildingSelectionCriteria: null,
  costsNotIncluded: null,
  creditHistory: null,
  criminalBackground: null,
  depositMin: null,
  depositMax: null,
  disableUnitsAccordion: false,
  leasingAgentEmail: null,
  leasingAgentName: null,
  leasingAgentOfficeHours: null,
  leasingAgentPhone: null,
  leasingAgentTitle: null,
  name: item.Name,
  postmarkedApplicationsReceivedByDate: null,
  programRules: null,
  rentalAssistance: null,
  rentalHistory: null,
  requiredDocuments: null,
  reservedCommunityType: item.Reserved_community_type && {
    id: null,
    name: item.Reserved_community_type,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  specialNotes: null,
  waitlistCurrentSize: 0, // todo: populate this field
  waitlistMaxSize: 0, // todo: populate this field
  whatToExpect: null, // todo: populate this field
  applicationConfig: null, // todo: populate this field
  reviewOrderType: EnumListingReviewOrderType.lottery,
  applicationDropOffAddress: null,
  applicationMailingAddress: null,
  unitsSummarized: UnitSummariesAdapter(item),
  units: [], // todo: populate this field
  buildingAddress: ListingAddressAdapter(item),
})

export default ListingAdapter
