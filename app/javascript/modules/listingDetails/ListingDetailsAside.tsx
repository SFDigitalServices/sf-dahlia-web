import React from "react"
import dayjs from "dayjs"
import { ApplicationStatus, ApplicationStatusType, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import bloomTheme from "../../../../tailwind.config"
import { ListingDetailsInfoSession } from "../listingDetailsAside/ListingDetailsInfoSession"
import { ListingDetailsApply } from "../listingDetailsAside/ListingDetailsApply"
import { ListingDetailsProcess } from "../listingDetailsAside/ListingDetailsProcess"

export interface ListingDetailsSidebarProps {
  listing: RailsListing
}

export const ListingDetailsAside = ({ listing }: ListingDetailsSidebarProps) => {
  const isApplicationOpen = dayjs(listing.Application_Due_Date) > dayjs()

  return (
    <aside className="w-full static md:absolute md:right-0 md:w-1/3 md:top-0 sm:w-2/3 md:ml-2 h-full md:border border-solid bg-white">
      <div className="hidden md:block">
        <ApplicationStatus
          content={t(
            isApplicationOpen
              ? "listingDetails.applicationDeadline.open"
              : "listingDetails.applicationDeadline.closed",
            {
              date: dayjs(listing.Application_Due_Date).format("MMM DD, YYYY"),
              time: dayjs(listing.Application_Due_Date).format("h:mm A"),
            }
          )}
          iconColor={!isApplicationOpen && bloomTheme.theme.colors.red["700"]}
          status={isApplicationOpen ? ApplicationStatusType.Open : ApplicationStatusType.Closed}
        />
        {isApplicationOpen && <ListingDetailsInfoSession listing={listing} />}
        <ListingDetailsApply listing={listing} />
        <ListingDetailsProcess listing={listing} />
      </div>
    </aside>
  )
}
