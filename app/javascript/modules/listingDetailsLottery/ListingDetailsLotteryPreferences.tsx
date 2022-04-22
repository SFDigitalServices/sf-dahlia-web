import React from "react"
import { t } from "@bloom-housing/ui-components"
import dayjs from "dayjs"
import { RailsLotteryBucketsDetails } from "../../api/types/rails/listings/RailsLotteryBucketsDetails"
import { RailsListing } from "../listings/SharedHelpers"

export interface ListingDetailsLotteryPreferencesProps {
  listing: RailsListing
  lotteryBucketsDetails: RailsLotteryBucketsDetails
}

export const ListingDetailsLotteryPreferences = ({
  listing,
  lotteryBucketsDetails,
}: ListingDetailsLotteryPreferencesProps) => {
  return (
    <div className="text-tiny">
      <p className="py-4 text-sm">{t("lottery.bucketsIntro")}</p>
      <h2 className="text-caps-underline">{t("lottery.housingPreferences")}</h2>
      <p className="border-b border-gray-450 mb-4 pb-4 text-gray-700 text-sm">
        {t("lottery.rankingOrderNote")}
      </p>
      {lotteryBucketsDetails.lotteryBuckets
        .filter((bucket) => bucket.preferenceName !== "generalLottery")
        .map((bucket, index, arr) => (
          <>
            <h3
              className="font-sans font-semibold text-tiny tracking-wide uppercase"
              key={bucket.preferenceOrder}
            >
              {bucket.preferenceName}
            </h3>
            <p className="text-tiny">
              {t("lottery.upToXUnitsAvailable", { units: bucket.unitsAvailable })}
            </p>
            <p className="text-gray-700 text-tiny">
              {t("lottery.numberApplicantsQualifiedForPreference", {
                number: bucket.totalSubmittedApps,
              })}
            </p>
            <hr className={arr.length - 1 === index ? "mt-4" : "my-4"} />
          </>
        ))}
      <div className="bg-gray-100 border-b mb-4 p-4">
        <hr className="border-b-4 border-primary" />
      </div>
      {lotteryBucketsDetails.lotteryBuckets
        .filter((bucket) => bucket.preferenceName === "generalLottery")
        .map((bucket) => (
          <div key={bucket.preferenceOrder}>
            <h3 className="font-sans font-semibold text-tiny tracking-wide uppercase">
              {t("lottery.generalPool")}
            </h3>
            <p className="text-tiny">{t("lottery.anyRemainingUnits")}</p>
            <p className=" border-b pb-2 text-gray-700 text-tiny">
              {t("lottery.numberApplicantsQualifiedForGeneralPool", {
                number: bucket.totalSubmittedApps,
              })}
            </p>
          </div>
        ))}
      <div className="bg-gray-100 mb-2 py-4 text-center">
        <a href="http://sfmohcd.org/housing-preference-programs" target="_blank">
          {t("lottery.readAboutPreferences")}
        </a>
      </div>
      <div className="text-center">
        <p className="py-2">
          {t("lottery.resultsFrom", {
            date: dayjs(listing.Lottery_Results_Date).format("MMM D, YYYY"),
          })}
        </p>
        <p className="py-2">
          <a href={listing.LotteryResultsURL} target="_blank">
            {t("lottery.lotteryResultsPdfLink")}
          </a>
        </p>
        <p className="text-gray-700 py-2">
          {t("lottery.unsortedResultsNote", {
            date: dayjs(listing.Lottery_Date).format("MMM D, YYYY"),
          })}
        </p>
      </div>
    </div>
  )
}
