import React from "react"
import { getEventNote, RailsListing } from "../listings/SharedHelpers"
import dayjs from "dayjs"
import { EventSection } from "@bloom-housing/ui-components"

export interface ListingDetailsProcessProps {
  listing: RailsListing
}

export const ListingDetailsProcess = ({ listing }: ListingDetailsProcessProps) => {
  return (
    !!listing.Lottery_Date &&
    dayjs(listing.Lottery_Date) > dayjs() &&
    !listing.LotteryResultsURL && (
      <EventSection
        events={[
          {
            dateString: dayjs(listing.Lottery_Date).format("MMMM DD, YYYY"),
            timeString: dayjs(listing.Lottery_Date).format("hh:mma"),
            note: getEventNote({
              City: listing.Lottery_City,
              Street_Address: listing.Lottery_Street_Address,
              Venue: listing.Lottery_Venue,
            }),
          },
        ]}
        headerText={"Public Lottery"}
        sectionHeader={true}
      />
    )
    /* TODO: Bloom prop changes <DownloadLotteryResults resultsDate={"January 1st, 2022"} pdfURL={""} /> */
    /* TODO: Bloom prop changes <WhatToExpect listing={null} /> */
    /* TODO: Bloom prop changes <LeasingAgent listing={null} />  */
    /* TODO: Last updated */
  )
}
