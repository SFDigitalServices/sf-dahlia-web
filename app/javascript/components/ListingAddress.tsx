import React from "react"
import { RailsListing } from "../modules/listings/SharedHelpers"

export interface ListingAddressProps {
  listing: RailsListing
  cityNewline?: boolean
}

export const ListingAddress = ({ listing, cityNewline }: ListingAddressProps) => {
  return listing.Building_Street_Address &&
    listing.Building_City &&
    listing.Building_State &&
    listing.Building_Zip_Code ? (
    <span>
      {listing.Building_Street_Address}
      {cityNewline ? <br /> : ", "}
      {listing.Building_City},{" "}
      <abbr className="no-underline" title="California">
        CA
      </abbr>{" "}
      {listing.Building_Zip_Code}
    </span>
  ) : (
    <></>
  )
}
