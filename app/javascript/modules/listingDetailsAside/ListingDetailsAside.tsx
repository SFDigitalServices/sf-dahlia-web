import React from "react"
import { ListingDetailItem, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsInfoSession } from "./ListingDetailsInfoSession"
import { ListingDetailsProcess } from "./ListingDetailsProcess"
import { isOpen } from "../../util/listingUtil"
import { ListingDetailsApply } from "./ListingDetailsApply"
import { ListingDetailsApplicationDate } from "./ListingDetailsApplicationDate"
import { ListingDetailsLotteryResults } from "../listingDetailsLottery/ListingDetailsLotteryResults"

export interface ListingDetailsSidebarProps {
  listing: RailsListing
  imageSrc: string
}

export const ListingDetailsAside = ({ listing, imageSrc }: ListingDetailsSidebarProps) => {
  const isApplicationOpen = isOpen(listing)

  return (
    <ListingDetailItem
      imageAlt={""}
      imageSrc={imageSrc}
      title={t("listings.process.header")}
      subtitle={t("listings.process.subheader")}
      hideHeader={true}
      desktopClass="header-hidden"
    >
      <aside className="w-full static md:absolute md:right-0 md:w-1/3 md:top-0 sm:w-2/3 md:ml-2 h-full md:border border-solid bg-white">
        <div className="hidden md:block">
          <ListingDetailsApplicationDate isApplicationOpen={isApplicationOpen} listing={listing} />
          <ListingDetailsLotteryResults listing={listing} />
          {isApplicationOpen && <ListingDetailsInfoSession listing={listing} />}
          <ListingDetailsApply listing={listing} />
          <ListingDetailsProcess listing={listing} />
        </div>
      </aside>
    </ListingDetailItem>
  )
}
