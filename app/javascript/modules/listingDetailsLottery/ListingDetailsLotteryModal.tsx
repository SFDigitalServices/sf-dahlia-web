import React, { useState } from "react"
import { Field, Heading, Icon, IconFillColors, t } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { RailsLotteryResult } from "../../api/types/rails/listings/RailsLotteryResult"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsLotteryPreferences } from "./ListingDetailsLotteryPreferences"
import "./ListingDetailsLotteryModal.scss"
import { getLotteryResults } from "../../api/listingApiService"
import { ListingDetailsLotteryRanking } from "./ListingDetailsLotteryRanking"
import { ListingDetailsLotteryModalFooter } from "./ListingDetailsLotteryModalFooter"

export enum LOTTERY_MODAL_STATE {
  INITIAL_STATE,
  LOADING,
  API_ERROR,
  INVALID_LOTTERY_NUMBER,
  SEARCH_RESULT_FOUND,
}

interface ListingDetailsLotteryModalProps {
  listing: RailsListing
  lotteryBucketDetails: RailsLotteryResult
}

export const ListingDetailsLotteryModal = ({
  listing,
  lotteryBucketDetails,
}: ListingDetailsLotteryModalProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { errors, handleSubmit, register } = useForm({ reValidateMode: "onSubmit" })
  const lotteryNumberField = "lotterySearchNumber"
  const [lotterySearchResult, setLotterySearchResult] = useState<RailsLotteryResult>()
  const [lotteryModalStatus, setLotteryModalStatus] = useState<LOTTERY_MODAL_STATE>(
    LOTTERY_MODAL_STATE.INITIAL_STATE
  )

  const onSubmit = (data: { lotterySearchNumber: string }) => {
    const { lotterySearchNumber } = data
    setLotteryModalStatus(LOTTERY_MODAL_STATE.LOADING)

    void getLotteryResults(listing.Id, lotterySearchNumber).then((lotterySearchResults) => {
      if (!lotterySearchResults) {
        // if we didn't get a result, general search api error
        setLotteryModalStatus(LOTTERY_MODAL_STATE.API_ERROR)
        return
      }

      const { lotteryBuckets } = lotterySearchResults
      if (
        // if we got a result but there are no buckets or none of the buckets have pref
        // results, then we don't have a valid lottery number
        !lotteryBuckets ||
        lotteryBuckets.filter((bucket) => bucket.preferenceResults.length > 0).length === 0
      ) {
        setLotteryModalStatus(LOTTERY_MODAL_STATE.INVALID_LOTTERY_NUMBER)
      } else {
        setLotteryModalStatus(LOTTERY_MODAL_STATE.SEARCH_RESULT_FOUND)
        setLotterySearchResult(lotterySearchResults)
      }
    })
  }

  let content: JSX.Element
  switch (lotteryModalStatus) {
    case LOTTERY_MODAL_STATE.INITIAL_STATE:
    case LOTTERY_MODAL_STATE.API_ERROR: {
      content = <ListingDetailsLotteryPreferences lotteryBucketsDetails={lotteryBucketDetails} />
      break
    }
    case LOTTERY_MODAL_STATE.LOADING: {
      content = (
        <div className="pb-4 text-center">
          <Icon size="large" symbol="spinner" />
        </div>
      )
      break
    }
    case LOTTERY_MODAL_STATE.INVALID_LOTTERY_NUMBER: {
      content = (
        <div className="my-6 text-gray-700">
          <p className="mb-2">{t("lottery.lotteryNumberNotFoundP2")}</p>
          <p className="mb-2">{t("lottery.lotteryNumberNotFoundP3")}</p>
        </div>
      )
      break
    }
    case LOTTERY_MODAL_STATE.SEARCH_RESULT_FOUND: {
      content = lotterySearchResult && (
        <ListingDetailsLotteryRanking lotteryResult={lotterySearchResult} />
      )
      break
    }
  }

  const errorMessage =
    (errors[lotteryNumberField]?.type === "required" && t("lottery.lotteryNumberNotValid")) ||
    (lotteryModalStatus === LOTTERY_MODAL_STATE.INVALID_LOTTERY_NUMBER &&
      t("lottery.lotteryNumberNotFoundP1")) ||
    (lotteryModalStatus === LOTTERY_MODAL_STATE.API_ERROR && t("error.lotteryRankingSearch"))

  return (
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
          error={!!errorMessage}
          className="w-full"
          errorMessage={errorMessage}
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
      <div aria-live="polite" aria-busy={lotteryModalStatus === LOTTERY_MODAL_STATE.LOADING}>
        {content}
      </div>
      <ListingDetailsLotteryModalFooter lotteryModalStatus={lotteryModalStatus} listing={listing} />
    </div>
  )
}
