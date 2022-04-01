import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { Waitlist } from "@bloom-housing/ui-components"

export interface ListingDetailsApplyProps {
  listing: RailsListing
}

export const ListingDetailsApply = ({ listing }: ListingDetailsApplyProps) => {
  return (
    <Waitlist
      isWaitlistOpen={!!listing.Maximum_waitlist_size || !!listing.Total_waitlist_openings}
      waitlistCurrentSize={listing.Units_Available}
      waitlistOpenSpots={listing.Total_waitlist_openings}
      waitlistMaxSize={listing.Maximum_waitlist_size}
    />
    /* TODO: this component will also include
        How to Apply
        Need Help
     */
  )
}
