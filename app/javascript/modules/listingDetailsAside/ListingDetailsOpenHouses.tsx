import React from "react"
import { getEventNote, RailsListing } from "../../modules/listings/SharedHelpers"
import "./ListingDetailsOpenHouses.scss"
import { Heading, t } from "@bloom-housing/ui-components"
import { getEventDateTime, getEventTimeString, sortByDateTimeString } from "../../util/listingUtil"
import { localizedFormat } from "../../util/languageUtil"
import { ListingEvent } from "../../api/types/rails/listings/BaseRailsListing"

export interface OpenHousesProps {
  listing: RailsListing
  sectionHeader?: boolean
}

export const ListingDetailsOpenHouses = ({ listing, sectionHeader = true }: OpenHousesProps) => {
  const events = listing.Open_Houses?.map((openHouse: ListingEvent) => {
    return {
      dateString: openHouse.Date && localizedFormat(openHouse.Date, "LL"),
      timeString: getEventTimeString(openHouse),
      note: getEventNote(openHouse, listing.translations, `${openHouse.Id}.Open_Houses.Venue__c`),
      dateStartTime: getEventDateTime(openHouse.Date, openHouse.Start_Time),
    }
  }).sort((a, b) => sortByDateTimeString(a.dateStartTime, b.dateStartTime))

  return (
    <>
      {listing.Open_Houses?.length ? (
        <div
          className={
            sectionHeader ? "open-houses border-b border-gray-400 md:border-b-0" : "open-houses"
          }
        >
          <section className={sectionHeader ? "aside-block" : ""}>
            {sectionHeader && (
              <Heading priority={4} styleType="underlineWeighted">
                {t("label.openHouses")}
              </Heading>
            )}
            {events.map((event, index) => (
              <div key={`events-${index}`} className={`${index !== events.length - 1 && "pb-3"}`}>
                {event.dateString && (
                  <p className="text text-gray-800 pb-2 flex justify-between items-center">
                    <span className="inline-block text-sm uppercase normal-case">
                      {event.dateString}
                    </span>
                    {event.timeString && (
                      <span className="inline-block text-xs font-bold ml-5 font-alt-sans">
                        {event.timeString}
                      </span>
                    )}
                  </p>
                )}
                {event.note && (
                  <div className={`text-sm text-gray-700 ${index !== events.length - 1 && "pb-3"}`}>
                    {typeof event.note === "string" ? <p>{event.note}</p> : event.note}
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>
      ) : null}
    </>
  )
}
