import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { QuantityRowSection, t } from "@bloom-housing/ui-components"

export interface ListingDetailsApplyProps {
  listing: RailsListing
}

/*
  TODO: this component will also include
  How to Apply
  Need Help
*/
export const ListingDetailsApply = ({ listing }: ListingDetailsApplyProps) => {
  const descriptionValues = {
    number: listing.Total_number_of_building_units,
    unit:
      listing.Total_number_of_building_units > 1
        ? t("listings.availableUnitsAndWaitlistDescription.pluralUnits")
        : t("listings.availableUnitsAndWaitlistDescription.singularUnit"),
  }
  const availableDescription = (
    <p>
      {t("listings.availableUnitsAndWaitlistDescription", {
        ...descriptionValues,
      })}
    </p>
  )

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
      <p>{t("listings.noAvailableUnits")}</p>
      <p>
        {t("listings.enterLotteryForWaitlist", {
          ...descriptionValues,
        })}
      </p>
    </>
  )

  const unavailableRows = [
    {
      amount: listing.Number_of_people_currently_on_waitlist,
      text: t("listings.currentWaitlistSize"),
      emphasized: true,
    },
    {
      amount: listing.Total_waitlist_openings,
      text: t("listings.openWaitlistSlots"),
      emphasized: true,
    },
    {
      amount: listing.Maximum_waitlist_size,
      text: t("listings.finalWaitlistSize"),
      emphasized: true,
    },
  ]

  return (
    <>
      {listing.hasWaitlist && (
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
