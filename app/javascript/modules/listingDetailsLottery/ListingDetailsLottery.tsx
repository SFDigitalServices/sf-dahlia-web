import React, { useEffect, useState } from "react"
import {
  AppearanceSizeType,
  AppearanceStyleType,
  Button,
  Heading,
  Modal,
  t,
} from "@bloom-housing/ui-components"
import { RailsListing } from "../listings/SharedHelpers"
import { isLotteryComplete } from "../../util/listingUtil"
import { getLotteryBucketDetails } from "../../api/listingApiService"
import { RailsLotteryResult } from "../../api/types/rails/listings/RailsLotteryResult"
import { ListingDetailsLotteryModal } from "./ListingDetailsLotteryModal"
import { localizedFormat, renderInlineWithInnerHTML } from "../../util/languageUtil"

export interface ListingDetailsLotteryProps {
  listing: RailsListing
}

export const ListingDetailsLottery = ({ listing }: ListingDetailsLotteryProps) => {
  const [lotteryBucketDetails, setLotteryBucketDetails] = useState<RailsLotteryResult>()
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    void getLotteryBucketDetails(listing.Id).then((lotteryBucketDetails) => {
      setLotteryBucketDetails(lotteryBucketDetails)
    })
  }, [listing.Id])

  return (
    isLotteryComplete(listing) && (
      <div className="border-b pt-4 text-center">
        <Heading className="mb-4" priority={4}>
          {t("lottery.lotteryResults")}
        </Heading>
        <p className="mb-4 text-sm uppercase">
          {localizedFormat(listing.Lottery_Results_Date, "LL")}
        </p>
        <div className="bg-gray-100 py-4">
          {listing.Lottery_Summary && (
            <div className="mb-3 mx-2 text-gray-700 text-sm">
              {renderInlineWithInnerHTML(listing.Lottery_Summary)}
            </div>
          )}
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

        {lotteryBucketDetails && (
          <Modal onClose={() => setIsModalOpen(false)} open={isModalOpen} title="">
            <ListingDetailsLotteryModal
              listing={listing}
              lotteryBucketDetails={lotteryBucketDetails}
            />
          </Modal>
        )}
      </div>
    )
  )
}
