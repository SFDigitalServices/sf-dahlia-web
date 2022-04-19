import React from "react"
import dayjs from "dayjs"
import { RailsListing } from "../listings/SharedHelpers"
import { isLotteryComplete } from "../../util/listingUtil"
import { AppearanceSizeType, AppearanceStyleType, Button, t } from "@bloom-housing/ui-components"

export interface ListingDetailsLotteryResultsProps {
  listing: RailsListing
}

export const ListingDetailsLotteryResults = ({ listing }: ListingDetailsLotteryResultsProps) => {
  return (
    isLotteryComplete(listing) && (
      <div className="border-b pt-4 text-center">
        <h4 className="mb-2 text-2xl">{t("listings.lottery.lotteryResults")}</h4>
        <p className="mb-4 text-sm uppercase">
          {dayjs(listing.Lottery_Results_Date).format("MMMM D, YYYY")}
        </p>
        <div className="bg-gray-100 py-4">
          <Button
            size={AppearanceSizeType.small}
            styleType={AppearanceStyleType.primary}
            onClick={() => {
              console.log("open me!")
            }}
          >
            {t("listings.lottery.viewLotteryResults")}
          </Button>
        </div>
      </div>
    )
  )
}
