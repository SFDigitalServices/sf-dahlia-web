import React from "react"
import { getEventNote, RailsListing } from "../listings/SharedHelpers"
import { EventSection, t } from "@bloom-housing/ui-components"
import { localizedFormat } from "../../util/languageUtil"
import { getEventTimeString } from "../../util/listingUtil"

export interface ListingDetailsInfoSessionProps {
  listing: RailsListing
}

export const ListingDetailsInfoSession = ({ listing }: ListingDetailsInfoSessionProps) => {
  return (
    <>
      {listing.Information_Sessions?.length > 0 ? (
        <div className="border-b border-gray-400 md:border-b-0">
          <EventSection
            dateClassName="normal-case"
            sectionHeader={true}
            events={listing.Information_Sessions?.map((informationSession) => {
              return {
                dateString:
                  informationSession.Date && localizedFormat(informationSession.Date, "LL"),
                timeString: getEventTimeString(informationSession),
                note: getEventNote(
                  informationSession,
                  listing.translations,
                  `${informationSession.Id}.Information_Sessions.Venue__c`
                ),
              }
            })}
            headerText={t("listings.process.informationSessions")}
          />
        </div>
      ) : null}
      {/* TODO: Bloom prop changes for get and submit application sections */}
    </>
  )
}
