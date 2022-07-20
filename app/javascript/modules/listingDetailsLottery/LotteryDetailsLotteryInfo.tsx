import React from "react"
import { SidebarBlock, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { localizedFormat, renderWithInnerHTML } from "../../util/languageUtil"
import { isLotteryComplete, isOpen } from "../../util/listingUtil"

export interface ListingDetailsLotteryInfoProps {
  listing: RailsListing
}

export const ListingDetailsLotteryInfo = ({ listing }: ListingDetailsLotteryInfoProps) => {
  if (isOpen(listing) || !listing.Lottery_Date || isLotteryComplete(listing)) {
    return null
  }

  return (
    <>
      <SidebarBlock title={t("label.lottery")}>
        <p className="flex justify-between mb-4">
          <span>{localizedFormat(listing.Lottery_Date, "LL")}</span>
          <span className="font-bold">{localizedFormat(listing.Lottery_Date, "LT")}</span>
        </p>
        {listing.Lottery_Venue && renderWithInnerHTML(listing.Lottery_Venue)}
        {process.env.COVID_UPDATE !== "true" && <p className="mt-4">{t("label.preLotteryInfo")}</p>}
      </SidebarBlock>

      <SidebarBlock title={t("lottery.lotteryResults")}>
        <p className="mb-4">{localizedFormat(listing.Lottery_Results_Date, "LL")}</p>
        <p>{t("lottery.completeResultsWillBePosted")}</p>
      </SidebarBlock>
    </>
  )
}
