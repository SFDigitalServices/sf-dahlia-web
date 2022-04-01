import React from "react"
import { ImageCard } from "@bloom-housing/ui-components"
import { getReservedCommunityType } from "../../util/languageUtil"
import { getListingAddressString, RailsListing } from "../listings/SharedHelpers"

export interface ListingDetailsImageCardProps {
  listing: RailsListing
}

export const ListingDetailsImageCard = ({ listing }: ListingDetailsImageCardProps) => {
  return (
    <header className="image-card--leader">
      <ImageCard
        imageUrl={listing?.imageURL}
        title={listing.Name}
        href={`/listings/${listing.listingID}`}
        tagLabel={getReservedCommunityType(listing.Reserved_community_type) ?? undefined}
      />
      <div className="p-3">
        <p className="font-alt-sans uppercase tracking-widest text-sm font-semibold">
          {getListingAddressString(listing)}
        </p>
        <p className="text-gray-700 text-base">{listing.Developer}</p>
        <p className="text-xs">
          <a href={"/"} target="_blank" aria-label="Opens in new window">
            View on Map
          </a>
        </p>
      </div>
    </header>
  )
}
