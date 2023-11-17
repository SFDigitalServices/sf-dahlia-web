import React from "react"
import { getEventNote, RailsListing } from "../../modules/listings/SharedHelpers"
import { EventSection, t } from "@bloom-housing/ui-components"
import type { ListingEvent } from "../../api/types/rails/listings/BaseRailsListing"
import { localizedFormat } from "../../util/languageUtil"
import { getEventTimeString, sortByDateTimeString } from "../../util/listingUtil"
import "./ListingDetailsOpenHouses.scss"

export interface OpenHousesProps {
  listing: RailsListing
}

export const ListingDetailsOpenHouses = ({ listing }: OpenHousesProps) => {
  return (
    <>
      {listing.Open_Houses?.length ? (
        <div className="border-b border-gray-400 md:border-b-0">
          <EventSection
            dateClassName="normal-case"
            events={listing.Open_Houses.sort((a, b) => sortByDateTimeString(a, b))?.map(
              (openHouse: ListingEvent) => {
                return {
                  dateString: openHouse.Date && localizedFormat(openHouse.Date, "LL"),
                  timeString: getEventTimeString(openHouse),
                  note: getEventNote(openHouse),
                }
              }
            )}
            sectionHeader={true}
            headerText={t("label.openHouses")}
          />
        </div>
      ) : null}
    </>
  )
}
