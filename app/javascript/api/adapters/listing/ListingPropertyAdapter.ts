import { Property } from "@bloom-housing/backend-core/types"

import RailsRentalListing from "../../types/rails/listings/RailsRentalListing"
import { Adapter } from "../adapter"
import ListingAddressAdapter from "./ListingAddressAdapter"
import UnitSummariesAdapter from "./UnitSummariesAdapter"

const getMinAndMaxHouseholdSize = (listing: RailsRentalListing): [number, number] | undefined => {
  const minOccupancy = listing.unitSummaries.general.map((unit) => unit.minOccupancy).sort()[0]
  const maxOccupancy = listing.unitSummaries.general
    .map((unit) => unit.maxOccupancy)
    .sort()
    .pop()
  return [minOccupancy, maxOccupancy]
}

const ListingPropertyAdapter: Adapter<RailsRentalListing, Property> = (
  listing: RailsRentalListing
) => {
  const [minHousehold, maxHousehold] = getMinAndMaxHouseholdSize(listing)
  return {
    unitsSummarized: UnitSummariesAdapter(listing),
    units: [], // todo: populate this field
    buildingAddress: ListingAddressAdapter(listing),
    id: listing.listingID,
    createdAt: null,
    updatedAt: null,
    accessibility: null,
    amenities: null,
    buildingTotalUnits: null,
    developer: null,
    householdSizeMax: maxHousehold,
    householdSizeMin: minHousehold,
    neighborhood: null,
    petPolicy: null,
    smokingPolicy: null,
    unitsAvailable: listing.Units_Available,
    unitAmenities: null,
    servicesOffered: null,
    yearBuilt: null,
  }
}

export default ListingPropertyAdapter
