import React from "react"
import { ImageCard, t } from "@bloom-housing/ui-components"
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
        href={`/listings/${listing.listingID}`}
        tags={
          listing.Reserved_community_type
            ? [{ text: getReservedCommunityType(listing.Reserved_community_type) }]
            : undefined
        }
      />
      <div className="p-3">
        <p className="font-alt-sans uppercase tracking-widest text-sm font-semibold">
          {getListingAddressString(listing)}
        </p>
        <p className="text-gray-700 text-base">{listing.Developer}</p>
        <p className="text-xs">
          <a href={"/"} target="_blank" aria-label="Opens in new window">
            {t("label.viewOnMap")}
          </a>
        </p>
      </div>
    </header>
  )
}
