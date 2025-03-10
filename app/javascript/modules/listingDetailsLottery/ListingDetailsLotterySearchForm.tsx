import React, { useState } from "react"
import { Field, Heading, Icon, IconFillColors, t } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import type { RailsLotteryResult } from "../../api/types/rails/listings/RailsLotteryResult"
import { RailsListing } from "../listings/SharedHelpers"
import { ListingDetailsLotteryPreferences } from "./ListingDetailsLotteryPreferences"
import { getLotteryResults } from "../../api/listingApiService"
import { ListingDetailsLotteryRanking } from "./ListingDetailsLotteryRanking"
import { ListingDetailsLotterySearchFooter } from "./ListingDetailsLotterySearchFooter"
import "./ListingDetailsLotterySearchForm.scss"
import ErrorBoundary, { BoundaryScope } from "../../components/ErrorBoundary"
import { isEducator, isEducatorOne } from "../../util/listingUtil"
import { ListingDetailsLotteryPreferencesEducator } from "./ListingDetailsLotteryPreferencesEducator"

export enum LOTTERY_SEARCH_FORM_STATUS {
  INITIAL_STATE,
  LOADING,
  API_ERROR,
  INVALID_LOTTERY_NUMBER,
  SEARCH_RESULT_FOUND,
}

interface ListingDetailsLotterySearchFormProps {
  listing: RailsListing
  lotteryBucketDetails: RailsLotteryResult
  lotteryNumber?: string
}

export const ListingDetailsLotterySearchForm = ({
  listing,
  lotteryBucketDetails,
  lotteryNumber,
}: ListingDetailsLotterySearchFormProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { errors, handleSubmit, register } = useForm({ reValidateMode: "onSubmit" })
  const lotteryNumberField = "lotterySearchNumber"
  const [lotterySearchResult, setLotterySearchResult] = useState<RailsLotteryResult>()
  const [lotteryFormStatus, setLotteryFormStatus] = useState<LOTTERY_SEARCH_FORM_STATUS>(
    LOTTERY_SEARCH_FORM_STATUS.INITIAL_STATE
  )

  const onSubmit = (data: { lotterySearchNumber: string }) => {
    let lotterySearchNumber = data.lotterySearchNumber

    if (lotterySearchNumber.length < 8) {
      lotterySearchNumber = "0".repeat(8 - lotterySearchNumber.length) + lotterySearchNumber
    }

    setLotteryFormStatus(LOTTERY_SEARCH_FORM_STATUS.LOADING)

    void getLotteryResults(listing.Id, lotterySearchNumber).then((lotterySearchResults) => {
      if (!lotterySearchResults) {
        // if we didn't get a result, general search api error
        setLotteryFormStatus(LOTTERY_SEARCH_FORM_STATUS.API_ERROR)
        return
      }

      const { lotteryBuckets } = lotterySearchResults
      if (
        // if we got a result but there are no buckets or none of the buckets have pref
        // results, then we don't have a valid lottery number
        !lotteryBuckets ||
        lotteryBuckets.filter((bucket) => bucket.preferenceResults.length > 0).length === 0
      ) {
        setLotteryFormStatus(LOTTERY_SEARCH_FORM_STATUS.INVALID_LOTTERY_NUMBER)
      } else {
        setLotteryFormStatus(LOTTERY_SEARCH_FORM_STATUS.SEARCH_RESULT_FOUND)
        setLotterySearchResult(lotterySearchResults)
      }
    })
  }

  React.useEffect(() => {
    if (lotteryNumber) {
      register({ name: lotteryNumberField, value: lotteryNumber })
      void onSubmit({ lotterySearchNumber: lotteryNumber })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  let content: JSX.Element
  switch (lotteryFormStatus) {
    case LOTTERY_SEARCH_FORM_STATUS.INITIAL_STATE:
    case LOTTERY_SEARCH_FORM_STATUS.API_ERROR: {
      // educator listings have a custom lottery modal because there are so many layered preferences
      // the custom modal will make the preferences easier to understand
      content = isEducator(listing) ? (
        <ListingDetailsLotteryPreferencesEducator
          lotteryBucketsDetails={lotteryBucketDetails}
          isEducatorOne={isEducatorOne(listing)}
        />
      ) : (
        <ListingDetailsLotteryPreferences
          lotteryBucketsDetails={lotteryBucketDetails}
          machineTranslations={listing.translations}
        />
      )
      break
    }
    case LOTTERY_SEARCH_FORM_STATUS.LOADING: {
      content = (
        <div className="pb-4 text-center">
          <Icon size="large" symbol="spinner" />
        </div>
      )
      break
    }
    case LOTTERY_SEARCH_FORM_STATUS.INVALID_LOTTERY_NUMBER: {
      content = (
        <div className="my-6 px-8 text-gray-700">
          <p className="mb-2">{t("lottery.lotteryNumberNotFoundP2")}</p>
          <p className="mb-2">{t("lottery.lotteryNumberNotFoundP3")}</p>
        </div>
      )
      break
    }
    case LOTTERY_SEARCH_FORM_STATUS.SEARCH_RESULT_FOUND: {
      content = lotterySearchResult && (
        <ListingDetailsLotteryRanking
          lotteryResult={lotterySearchResult}
          listingIsEducator={isEducator(listing)}
          listingIsEducatorOne={isEducatorOne(listing)}
        />
      )
      break
    }
  }

  const errorMessage =
    (["required", "pattern"].includes(String(errors[lotteryNumberField]?.type)) &&
      t("lottery.lotteryNumberNotValid")) ||
    (lotteryFormStatus === LOTTERY_SEARCH_FORM_STATUS.INVALID_LOTTERY_NUMBER &&
      t("lottery.lotteryNumberNotFoundP1")) ||
    (lotteryFormStatus === LOTTERY_SEARCH_FORM_STATUS.API_ERROR && t("error.lotteryRankingSearch"))

  return (
    <div className="lottery-search-form">
      <header className="pt-8 pb-4 text-center bg-white sticky top-0 z-50">
        <Heading>{t("lottery.lotteryResults")}</Heading>
        <h2 className="font-sans font-semibold text-xs uppercase notranslate">{listing.Name}</h2>
      </header>
      <p className="px-8 pb-4 text-xs">{t("lottery.bucketsIntro")}</p>
      <form
        id="search-form"
        className="bg-gray-100 flex mb-4 px-6 py-4"
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(onSubmit)}
      >
        <Field
          error={!!errorMessage}
          className="w-full mb-0"
          errorMessage={errorMessage}
          register={register}
          name={lotteryNumberField}
          placeholder={t("lottery.enterLotteryNumber")}
          type="text"
          validation={{ pattern: /^\d+$/, required: true }}
          label={t("lottery.enterLotteryNumber")}
          labelClassName="sr-only"
          defaultValue={lotteryNumber}
        />
        <button
          className="bg-blue-500 h-12 p-3 translate"
          type="submit"
          aria-label={t("lottery.submitNumber")}
        >
          <Icon fill={IconFillColors.white} size="medium" symbol="right" />
        </button>
      </form>
      <ErrorBoundary boundaryScope={BoundaryScope.component}>
        <div
          aria-live="polite"
          aria-busy={lotteryFormStatus === LOTTERY_SEARCH_FORM_STATUS.LOADING}
        >
          {content}
        </div>
      </ErrorBoundary>
      <ListingDetailsLotterySearchFooter
        lotterySearchFormStatus={lotteryFormStatus}
        listing={listing}
      />
    </div>
  )
}
