import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { ApplicationStatus, ApplicationStatusType } from "@bloom-housing/ui-components"
import bloomTheme from "../../../../tailwind.config"
import { getApplicationDeadlineString } from "../../util/languageUtil"

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
        content={getApplicationDeadlineString(isApplicationOpen, listing.Application_Due_Date)}
        iconColor={!isApplicationOpen && bloomTheme.theme.colors.red["700"]}
        status={isApplicationOpen ? ApplicationStatusType.Open : ApplicationStatusType.Closed}
      />
    </div>
  )
}
