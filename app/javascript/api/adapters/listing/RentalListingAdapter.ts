import {
  Listing,
  ListingStatus,
  CSVFormattingType,
  CountyCode,
} from "@bloom-housing/backend-core/types"

import RailsRentalListing from "../../types/rails/listings/RailsRentalListing"
import { Adapter } from "../adapter"
import ListingPropertyAdapter from "./ListingPropertyAdapter"

const toDate = (s: string): Date => new Date(s) // todo: handle different formats, actually implement this properly

const ListingAdapter: Adapter<RailsRentalListing, Listing> = (item: RailsRentalListing) => ({
  status: ListingStatus.active,
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
  assets: [],
  events: [],
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
  specialNotes: null,
  waitlistCurrentSize: 0, // todo: populate this field
  waitlistMaxSize: 0, // todo: populate this field
  whatToExpect: null, // todo: populate this field
  applicationConfig: null, // todo: populate this field
})

export default ListingAdapter
