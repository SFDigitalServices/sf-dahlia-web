import React from "react"
import { getEventNote, RailsListing } from "../listings/SharedHelpers"
import { EventSection, t } from "@bloom-housing/ui-components"
import { localizedFormat } from "../../util/languageUtil"
import { getEventTimeString } from "../../util/listingUtil"
import OpenHouses from "../../components/OpenHouses"

export interface ListingDetailsInfoSessionProps {
  listing: RailsListing
}

export const ListingDetailsInfoSession = ({ listing }: ListingDetailsInfoSessionProps) => {
  return (
    <>
      {listing.Information_Sessions?.length > 0 ? (
        <EventSection
          sectionHeader={true}
          events={listing.Information_Sessions?.map((informationSession) => {
            return {
              dateString: localizedFormat(informationSession.Date, "LL"),
              timeString: getEventTimeString(informationSession),
              note: getEventNote(informationSession),
            }
          })}
          headerText={t("listings.process.informationSessions")}
        />
      ) : null}
      <OpenHouses listing={listing} />
      {/* TODO: Bloom prop changes for get and submit application sections */}
    </>
  )
}
