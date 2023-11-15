import React from "react"
import { getEventNote, RailsListing } from "../../modules/listings/SharedHelpers"
import { EventSection, t } from "@bloom-housing/ui-components"
import type { ListingEvent } from "../../api/types/rails/listings/BaseRailsListing"
import { localizedFormat } from "../../util/languageUtil"
import { getEventTimeString } from "../../util/listingUtil"
import "./ListingDetailsOpenHouses.scss"
import { sortBy } from "lodash"

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
            events={sortBy(listing.Open_Houses, ["Date", "Start_Time"])?.map(
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
