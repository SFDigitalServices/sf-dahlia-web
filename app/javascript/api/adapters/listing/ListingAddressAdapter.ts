import { Address } from "@bloom-housing/backend-core/types"

import RailsRentalListing from "../../types/rails/listings/RailsRentalListing"
import { Adapter } from "../adapter"

const ListingAddressAdapter: Adapter<RailsRentalListing, Address> = (item: RailsRentalListing) => ({
  id: item.listingID,
  createdAt: null,
  updatedAt: null,
  placeName: item.Building_Name,
  city: item.Building_City,
  county: "San Francisco",
  state: item.Building_State,
  street: item.Building_Street_Address,
  street2: null,
  zipCode: item.Building_Zip_Code,
  latitude: null,
  longitude: null,
})

export default ListingAddressAdapter
