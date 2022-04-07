import React from "react"
import { ListingDetailItem, t } from "@bloom-housing/ui-components"

export interface ListingDetailsEligibilityProps {
  imageSrc: string
}

export const ListingDetailsNeighborhood = ({ imageSrc }: ListingDetailsEligibilityProps) => {
  return (
    <ListingDetailItem
      imageAlt={""}
      imageSrc={imageSrc}
      title={t("listings.neighborhood.header")}
      subtitle={t("listings.neighborhood.subheader")}
    >
      Map
    </ListingDetailItem>
  )
}
