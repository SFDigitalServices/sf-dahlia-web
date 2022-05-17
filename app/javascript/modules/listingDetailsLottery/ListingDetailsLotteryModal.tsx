import React, { useState } from "react"
import { Field, Heading, Icon, IconFillColors, Modal, t } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { RailsLotteryBucketsDetails } from "../../api/types/rails/listings/RailsLotteryBucketsDetails"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsLotteryPreferences } from "./ListingDetailsLotteryPreferences"
import "./ListingDetailsLotteryModal.scss"
import { getLotteryResults } from "../../api/listingApiService"
import { RailsLotteryRanking } from "../../api/types/rails/listings/RailsLotteryRanking"
import { ListingDetailsLotteryRanking } from "./ListingDetailsLotteryRanking"
import { ListingDetailsLotteryModalFooter } from "./ListingDetailsLotteryModalFooter"

export enum STATES {
  INITIAL_STATE,
  LOADING,
  API_ERROR,
  INVALID_LOTTERY_NUMBER,
  SEARCH_RESULT_FOUND,
}

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
  const { errors, handleSubmit, register } = useForm({ reValidateMode: "onSubmit" })
  const lotteryNumberField = "lotterySearchNumber"
  const [lotterySearchResult, setLotterySearchResult] = useState<RailsLotteryRanking>()

  const [lotteryModalStatus, setLotteryModalStatus] = useState<STATES>(STATES.INITIAL_STATE)

  const onModalClose = () => {
    setLotteryModalStatus(STATES.INITIAL_STATE)
    onClose()
  }

  const onSubmit = (data: { lotterySearchNumber: string }) => {
    const { lotterySearchNumber } = data
    setLotteryModalStatus(STATES.LOADING)

    void getLotteryResults(listing.Id, lotterySearchNumber).then((lotterySearchResults) => {
      if (!lotterySearchResults) {
        // if we didn't get a result, general search api error
        setLotteryModalStatus(STATES.API_ERROR)
        return
      }

      const { lotteryBuckets } = lotterySearchResults
      if (
        // if we got a result but there are no buckets or none of the buckets have pref
        // results, then we don't have a valid lottery number
        !lotteryBuckets ||
        lotteryBuckets.filter((bucket) => bucket.preferenceResults.length > 0).length === 0
      ) {
        setLotteryModalStatus(STATES.INVALID_LOTTERY_NUMBER)
      } else {
        setLotteryModalStatus(STATES.SEARCH_RESULT_FOUND)
        setLotterySearchResult(lotterySearchResults)
      }
    })
  }

  let content: JSX.Element
  switch (lotteryModalStatus) {
    case STATES.LOADING: {
      content = (
        <div className="text-center">
          <Icon size="large" symbol="spinner" />
        </div>
      )
      break
    }
    case STATES.INVALID_LOTTERY_NUMBER: {
      content = (
        <div className="my-6 text-gray-700">
          <p className="mb-2">{t("lottery.lotteryNumberNotFoundP2")}</p>
          <p className="mb-2">{t("lottery.lotteryNumberNotFoundP3")}</p>
        </div>
      )
      break
    }
    case STATES.SEARCH_RESULT_FOUND: {
      content = lotterySearchResult && (
        <ListingDetailsLotteryRanking lotteryRanking={lotterySearchResult} />
      )
      break
    }
    case STATES.INITIAL_STATE: {
      content = <ListingDetailsLotteryPreferences lotteryBucketsDetails={lotteryBucketDetails} />
      break
    }
  }

  const errorMessage =
    (errors[lotteryNumberField]?.type === "required" && t("lottery.lotteryNumberNotValid")) ||
    (lotteryModalStatus === STATES.INVALID_LOTTERY_NUMBER &&
      t("lottery.lotteryNumberNotFoundP1")) ||
    (lotteryModalStatus === STATES.API_ERROR && t("error.lotteryRankingSearch"))

  return (
    <Modal onClose={onModalClose} open={isOpen} title="">
      <div className="lottery-modal w-96">
        <header className="pb-4 text-center">
          <Heading>{t("lottery.lotteryResults")}</Heading>
          <h2 className="font-sans font-semibold text-sm uppercase">{listing.Name}</h2>
        </header>
        <form
          className="bg-gray-100 flex lottery-results-form mb-4 px-6 py-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Field
            error={
              errors[lotteryNumberField] ||
              lotteryModalStatus === STATES.API_ERROR ||
              lotteryModalStatus === STATES.INVALID_LOTTERY_NUMBER
            }
            className="w-full"
            errorMessage={
              errorMessage ||
              (errors[lotteryNumberField]?.type === "required" &&
                t("lottery.lotteryNumberNotValid"))
            }
            register={register}
            name={lotteryNumberField}
            placeholder={t("lottery.enterLotteryNumber")}
            type="text"
            validation={{ required: true }}
          />
          <button className="bg-blue-600 h-12 mt-2 p-3">
            <Icon fill={IconFillColors.white} size="medium" symbol="right" />
          </button>
        </form>
        {content}
        <ListingDetailsLotteryModalFooter
          lotteryModalStatus={lotteryModalStatus}
          listing={listing}
        />
      </div>
    </Modal>
  )
}
