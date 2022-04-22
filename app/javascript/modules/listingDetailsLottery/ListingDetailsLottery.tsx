import React, { useEffect, useState } from "react"
import dayjs from "dayjs"
import { AppearanceSizeType, AppearanceStyleType, Button, t } from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { isLotteryComplete } from "../../util/listingUtil"
import { getLotteryBucketDetails } from "../../api/listingApiService"
import { RailsLotteryBucketsDetails } from "../../api/types/rails/listings/RailsLotteryBucketsDetails"
import { ListingDetailsLotteryModal } from "./ListingDetailsLotteryModal"

export interface ListingDetailsLotteryProps {
  listing: RailsListing
}

export const ListingDetailsLottery = ({ listing }: ListingDetailsLotteryProps) => {
  const [lotteryBucketDetails, setLotteryBucketDetails] = useState<RailsLotteryBucketsDetails>()
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    void getLotteryBucketDetails(listing.Id).then((lotteryBucketDetails) => {
      setLotteryBucketDetails(lotteryBucketDetails)
    })
  }, [listing.Id])

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
              setIsModalOpen(true)
            }}
          >
            {t("listings.lottery.viewLotteryResults")}
          </Button>
        </div>

        <ListingDetailsLotteryModal
          isOpen={isModalOpen}
          listing={listing}
          lotteryBucketDetails={lotteryBucketDetails}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    )
  )
}
