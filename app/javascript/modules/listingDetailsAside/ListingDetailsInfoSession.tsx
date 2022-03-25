import React from "react"
import { getEventNote, RailsListing } from "../listings/SharedHelpers"
import { EventSection } from "@bloom-housing/ui-components"
import dayjs from "dayjs"
import { ListingEvent } from "../../api/types/rails/listings/BaseRailsListing"

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
            events={[
              {
                dateString: dayjs(informationSession.Date).format("MMMM DD"),
                timeString: getEventTimeString(informationSession),
                note: getEventNote(informationSession),
              },
            ]}
            headerText={"Information Sessions"}
          />
        )
      })}
      {listing.Open_Houses?.length && (
        <EventSection
          events={listing.Open_Houses?.map((openHouse) => {
            return {
              dateString: dayjs(openHouse.Date).format("MMMM DD"),
              timeString: getEventTimeString(openHouse),
              note: getEventNote(openHouse),
            }
          })}
          headerText={"Open Houses"}
        />
      )}
      {/* TODO: Bloom prop changes for get and submit application sections */}
    </>
  )
}
