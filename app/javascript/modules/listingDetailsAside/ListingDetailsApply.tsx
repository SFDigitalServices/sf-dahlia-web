import React from "react"
import dayjs from "dayjs"
import { QuantityRowSection, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { isLotteryComplete } from "../../util/listingUtil"

export interface ListingDetailsApplyProps {
  listing: RailsListing
}

/*
  TODO: this component will also include
  How to Apply
  Need Help
*/
export const ListingDetailsApply = ({ listing }: ListingDetailsApplyProps) => {
  const availableDescription = <p>{t("listings.availableUnitsAndWaitlistDescription")}</p>

  const availableRows = [
    {
      amount: listing.Units_Available,
      text: t("listings.availableUnits"),
      emphasized: true,
    },
    {
      amount: listing.Total_waitlist_openings,
      text: t("listings.openWaitlistSlots"),
      emphasized: true,
    },
  ]

  const unavailableDescription = (
    <>
      <p className={"mb-2"}>{t("listings.noAvailableUnits")}</p>
      <p>{t("listings.enterLotteryForWaitlist")}</p>
    </>
  )

  const unavailableRows = [
    {
      amount: listing.Number_of_people_currently_on_waitlist,
      text: t("listings.currentWaitlistSize"),
      emphasized: false,
    },
    {
      amount: listing.Total_waitlist_openings,
      text: t("listings.openWaitlistSlots"),
      emphasized: true,
    },
    {
      amount: listing.Maximum_waitlist_size,
      text: t("listings.finalWaitlistSize"),
      emphasized: false,
    },
  ]

  const listingsOpen = dayjs(listing.Application_Due_Date) > dayjs()

  return (
    <>
      {listing.hasWaitlist && (listingsOpen || isLotteryComplete(listing)) && (
        <>
          {listing.Units_Available === 0 && (
            <QuantityRowSection
              quantityRows={unavailableRows}
              strings={{
                sectionTitle: t("listings.waitlistIsOpen"),
                description: unavailableDescription,
              }}
            />
          )}
          {listing.Units_Available > 0 && (
            <QuantityRowSection
              quantityRows={availableRows}
              strings={{
                sectionTitle: t("listings.availableUnitsAndWaitlist"),
                description: availableDescription,
              }}
            />
          )}
        </>
      )}
    </>
  )
}
