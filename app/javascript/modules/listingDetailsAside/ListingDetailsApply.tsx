import React from "react"
import { RailsListing } from "../listings/SharedHelpers"
import { QuantityRowSection, t } from "@bloom-housing/ui-components"
import { renderInlineWithInnerHTML } from "../../util/languageUtil"

export interface ListingDetailsApplyProps {
  listing: RailsListing
}

/*
  TODO: this component will also include
  How to Apply
  Need Help
*/
export const ListingDetailsApply = ({ listing }: ListingDetailsApplyProps) => {
  const formattedDescription = renderInlineWithInnerHTML(
    t("listings.availableUnitsAndWaitlistDescription", {
      number: listing.Units_Available,
      unit:
        listing.Units_Available > 1
          ? t("listings.availableUnitsAndWaitlistDescription.pluralUnits")
          : t("listings.availableUnitsAndWaitlistDescription.singularUnit"),
    })
  )
  return (
    <>
      {listing.Total_waitlist_openings > 0 && listing.Units_Available > 0 && (
        <QuantityRowSection
          quantityRows={[
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
          ]}
          strings={{
            sectionTitle: t("listings.availableUnitsAndWaitlist"),
            description: formattedDescription,
          }}
        />
      )}
    </>
  )
}
