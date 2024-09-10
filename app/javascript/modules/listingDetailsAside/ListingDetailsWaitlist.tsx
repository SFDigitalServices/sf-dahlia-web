import React from "react"
import { QuantityRowSection, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { isLotteryComplete, isOpen } from "../../util/listingUtil"

export interface ListingDetailsWaitlistProps {
  listing: RailsListing
}

export const ListingDetailsWaitlist = ({ listing }: ListingDetailsWaitlistProps) => {
  if (!listing.hasWaitlist || (!isOpen(listing) && !isLotteryComplete(listing)))
    return null

  const waitlistUnavailableDescription = (
    <>
      <p className={"mb-2"}>{t("listings.noAvailableUnits")}</p>
      <p>{t("listings.enterLotteryForWaitlist")}</p>
    </>
  )

  const waitlistAvailableDescription = (
    <p>
      {t("listings.availableUnitsAndWaitlistDescription", listing.Total_number_of_building_units)}
    </p>
  )

  const waitlistUnavailableRows = [
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

  const waitlistAvailableRows = [
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

  return (
    <div className="w-full px-4 md:px-0">
      {listing.Units_Available === 0 && (
        <QuantityRowSection
          quantityRows={waitlistUnavailableRows}
          strings={{
            sectionTitle: t("listings.waitlistIsOpen"),
            description: waitlistUnavailableDescription,
          }}
        />
      )}
      {listing.Units_Available > 0 && (
        <QuantityRowSection
          quantityRows={waitlistAvailableRows}
          strings={{
            sectionTitle: t("listings.availableUnitsAndWaitlist"),
            description: waitlistAvailableDescription,
          }}
        />
      )}
    </div>
  )
}
