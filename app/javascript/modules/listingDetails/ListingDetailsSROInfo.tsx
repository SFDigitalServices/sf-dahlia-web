import React from "react"
import { InfoCard, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { isPluralSRO } from "../../util/listingUtil"

export interface ListingDetailsSROInfo {
  listing: RailsListing
}

export const ListingDetailsSROInfo = ({ listing }: ListingDetailsSROInfo) => (
  <InfoCard title={t("listings.singleRoomOccupancy")}>
    {!isPluralSRO(listing)
      ? t("listings.singleRoomOccupancyDescription")
      : t("listings.merryGoRoundSingleRoomOccupancyDescription")}
  </InfoCard>
)
