import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import dayjs from "dayjs"
import { ApplicationStatus, ApplicationStatusType, t } from "@bloom-housing/ui-components"
import bloomTheme from "../../../../tailwind.config"
import { localizedFormat } from "../../util/languageUtil"

export interface ListingDetailsApplicationDateProps {
  isApplicationOpen: boolean
  listing: RailsListing
}

export const ListingDetailsApplicationDate = ({
  isApplicationOpen,
  listing,
}: ListingDetailsApplicationDateProps) => {
  return (
    <div className="w-full mb-8 md:mb-0">
      <ApplicationStatus
        className="place-content-center"
        content={t(
          isApplicationOpen
            ? "listingDetails.applicationDeadline.open"
            : "listingDetails.applicationDeadline.closed",
          {
            date: localizedFormat(listing.Application_Due_Date, "ll"),
            time: dayjs(listing.Application_Due_Date).format("h:mm A"),
          }
        )}
        iconColor={!isApplicationOpen && bloomTheme.theme.colors.red["700"]}
        status={isApplicationOpen ? ApplicationStatusType.Open : ApplicationStatusType.Closed}
      />
    </div>
  )
}
