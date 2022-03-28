import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsInfoSession } from "../listingDetailsAside/ListingDetailsInfoSession"
import { ListingDetailsApply } from "../listingDetailsAside/ListingDetailsApply"
import { ListingDetailsProcess } from "../listingDetailsAside/ListingDetailsProcess"
import { isOpen } from "../../util/listingUtil"
import { ListingDetailsApplicationDate } from "../listingDetailsAside/ListingDetailsApplicationDate"

export interface ListingDetailsSidebarProps {
  listing: RailsListing
}

export const ListingDetailsAside = ({ listing }: ListingDetailsSidebarProps) => {
  const isApplicationOpen = isOpen(listing)

  return (
    <aside className="w-full static md:absolute md:right-0 md:w-1/3 md:top-0 sm:w-2/3 md:ml-2 h-full md:border border-solid bg-white">
      <div className="hidden md:block">
        <ListingDetailsApplicationDate listing={listing} />
        {isApplicationOpen && <ListingDetailsInfoSession listing={listing} />}
        <ListingDetailsApply listing={listing} />
        <ListingDetailsProcess listing={listing} />
      </div>
    </aside>
  )
}
