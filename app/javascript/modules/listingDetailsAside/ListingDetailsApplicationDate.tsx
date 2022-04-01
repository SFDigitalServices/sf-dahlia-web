import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import dayjs from "dayjs"
import { ApplicationStatus, ApplicationStatusType, t } from "@bloom-housing/ui-components"
import bloomTheme from "../../../../tailwind.config"

export interface ListingDetailsApplicationDateProps {
  isApplicationOpen: boolean
  listing: RailsListing
}

export const ListingDetailsApplicationDate = ({
  isApplicationOpen,
  listing,
}: ListingDetailsApplicationDateProps) => {
  return (
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
  )
}
