import React from "react"
import { getEventNote, RailsListing } from "../listings/SharedHelpers"
import { EventSection, t } from "@bloom-housing/ui-components"
import { ListingEvent } from "../../api/types/rails/listings/BaseRailsListing"
import { localizedFormat } from "../../util/languageUtil"

export interface ListingDetailsInfoSessionProps {
  listing: RailsListing
}

const getEventTimeString = (listingEvent: ListingEvent) => {
  if (listingEvent.Start_Time) {
    return listingEvent.End_Time
      ? `${listingEvent.Start_Time} - ${listingEvent.End_Time}`
      : listingEvent.Start_Time
  }
  return ""
}

export const ListingDetailsInfoSession = ({ listing }: ListingDetailsInfoSessionProps) => {
  return (
    <>
      {listing.Information_Sessions?.map((informationSession) => {
        return (
          <EventSection
            sectionHeader={true}
            events={[
              {
                dateString: localizedFormat(informationSession.Date, "LL"),
                timeString: getEventTimeString(informationSession),
                note: getEventNote(informationSession),
              },
            ]}
            headerText={t("listings.process.informationSessions")}
          />
        )
      })}
      {listing.Open_Houses?.length && (
        <EventSection
          events={listing.Open_Houses?.map((openHouse) => {
            return {
              dateString: localizedFormat(openHouse.Date, "LL"),
              timeString: getEventTimeString(openHouse),
              note: getEventNote(openHouse),
            }
          })}
          sectionHeader={true}
          headerText={t("label.openHouses")}
        />
      )}
      {/* TODO: Bloom prop changes for get and submit application sections */}
    </>
  )
}
