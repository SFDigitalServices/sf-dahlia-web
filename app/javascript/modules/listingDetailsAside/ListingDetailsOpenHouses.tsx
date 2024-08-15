import React from "react"
import { getEventNote, RailsListing } from "../../modules/listings/SharedHelpers"
import { EventSection, t } from "@bloom-housing/ui-components"
import type { ListingEvent } from "../../api/types/rails/listings/BaseRailsListing"
import { localizedFormat } from "../../util/languageUtil"
import { getEventDateTime, getEventTimeString, sortByDateTimeString } from "../../util/listingUtil"
import "./ListingDetailsOpenHouses.scss"

export interface OpenHousesProps {
  listing: RailsListing
}

export const ListingDetailsOpenHouses = ({ listing }: OpenHousesProps) => {
  return (
    <>
      {listing.Open_Houses?.length ? (
        <div className="open-houses border-b border-gray-400 md:border-b-0">
          <EventSection
            dateClassName="normal-case"
            events={listing.Open_Houses?.map((openHouse: ListingEvent) => {
              return {
                dateString: openHouse.Date && localizedFormat(openHouse.Date, "LL"),
                timeString: getEventTimeString(openHouse),
                note: getEventNote(openHouse),
                dateStartTime: getEventDateTime(openHouse.Date, openHouse.Start_Time),
              }
            }).sort((a, b) => sortByDateTimeString(a.dateStartTime, b.dateStartTime))}
            sectionHeader={true}
            headerText={t("label.openHouses")}
          />
        </div>
      ) : null}
    </>
  )
}
