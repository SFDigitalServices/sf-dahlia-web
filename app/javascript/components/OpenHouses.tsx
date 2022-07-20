import React from "react"
import { getEventNote, RailsListing } from "../modules/listings/SharedHelpers"
import { EventSection, t } from "@bloom-housing/ui-components"
import { ListingEvent } from "../api/types/rails/listings/BaseRailsListing"
import { localizedFormat } from "../util/languageUtil"
import { listingEventHasDate, getEventTimeString } from "../util/listingUtil"

export interface OpenHousesProps {
  listing: RailsListing
}

const OpenHouses = ({ listing }: OpenHousesProps) => {
  return (
    <>
      {listing.Open_Houses?.filter((openHouse: ListingEvent) => {
        return listingEventHasDate(openHouse)
      }).length ? (
        <EventSection
          events={listing.Open_Houses?.filter((openHouse: ListingEvent) => {
            return listingEventHasDate(openHouse)
          }).map((openHouse: ListingEvent) => {
            return {
              dateString: localizedFormat(openHouse.Date, "LL"),
              timeString: getEventTimeString(openHouse),
              note: getEventNote(openHouse),
            }
          })}
          sectionHeader={true}
          headerText={t("label.openHouses")}
        />
      ) : null}
    </>
  )
}

export default OpenHouses
