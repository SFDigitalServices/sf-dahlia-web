import { Field, Modal, t } from "@bloom-housing/ui-components"
import React from "react"
import { useForm } from "react-hook-form"
import { RailsLotteryBucketsDetails } from "../../api/types/rails/listings/RailsLotteryBucketsDetails"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsLotteryPreferences } from "./ListingDetailsLotteryPreferences"

interface ListingDetailsLotteryModalProps {
  isOpen: boolean
  listing: RailsListing
  lotteryBucketDetails: RailsLotteryBucketsDetails
  onClose: () => void
}

export const ListingDetailsLotteryModal = ({
  isOpen,
  listing,
  lotteryBucketDetails,
  onClose,
}: ListingDetailsLotteryModalProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register } = useForm({ mode: "onChange" })

  return (
    <Modal onClose={onClose} open={isOpen} title="">
      <div className="w-96">
        <header className="pb-4 text-center">
          <h1 className="">{t("listings.lottery.lotteryResults")}</h1>
          <h2 className="font-sans font-semibold text-sm uppercase">{listing.Name}</h2>
        </header>
        <form className="bg-gray-100 px-6 py-4">
          <Field
            register={register}
            name="lottery-search-number"
            placeholder={t("lottery.enterLotteryNumber")}
            type="text"
          />
        </form>
        {lotteryBucketDetails?.lotteryBuckets && (
          <ListingDetailsLotteryPreferences
            listing={listing}
            lotteryBucketsDetails={lotteryBucketDetails}
          />
        )}
      </div>
    </Modal>
  )
}
