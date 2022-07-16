import React from "react"
import { Heading, t } from "@bloom-housing/ui-components"
import { RailsLotteryResult } from "../../api/types/rails/listings/RailsLotteryResult"

export interface ListingDetailsLotteryPreferencesProps {
  lotteryBucketsDetails: RailsLotteryResult
}

export const ListingDetailsLotteryPreferences = ({
  lotteryBucketsDetails,
}: ListingDetailsLotteryPreferencesProps) => {
  return (
    <div className="text-tiny">
      <p className="px-8 pb-4 text-sm">{t("lottery.bucketsIntro")}</p>
      <header className="px-8">
        <Heading className="text-caps-underline" priority={2}>
          {t("lottery.housingPreferences")}
        </Heading>
        <p className="border-b border-gray-450 mb-4 pb-4 text-gray-700 text-sm">
          {t("lottery.rankingOrderNote")}
        </p>
      </header>
      {lotteryBucketsDetails.lotteryBuckets
        .filter(
          (bucket) =>
            bucket.preferenceName !== "generalLottery" && bucket.preferenceResults?.length > 0
        )
        .map((bucket, index, arr) => (
          <div key={bucket.preferenceOrder}>
            <div className="px-8 " key={bucket.preferenceOrder}>
              <Heading
                className="font-sans font-semibold text-tiny tracking-wide uppercase"
                priority={3}
              >
                {bucket.preferenceName}
              </Heading>
              <p className="text-tiny">
                {t("lottery.upToXUnitsAvailable", { units: bucket.unitsAvailable })}
              </p>
              <p className="text-gray-700 text-tiny">
                {t("lottery.numberApplicantsQualifiedForPreference", {
                  number: bucket.totalSubmittedApps,
                })}
              </p>
            </div>
            <hr className={arr.length - 1 === index ? "mt-4" : "my-4 mx-8"} />
          </div>
        ))}
      <div className="bg-gray-100 border-b mb-4 p-4">
        <hr className="border-b-4 border-primary" />
      </div>
      {lotteryBucketsDetails.lotteryBuckets
        .filter((bucket) => bucket.preferenceName === "generalLottery")
        .map((bucket) => (
          <>
            <div className="px-8" key={bucket.preferenceOrder}>
              <Heading
                className="font-sans font-semibold text-tiny tracking-wide uppercase"
                priority={3}
              >
                {t("lottery.generalPool")}
              </Heading>
              <p className="mb-1 text-tiny">{t("lottery.anyRemainingUnits")}</p>
              <p className="text-gray-700 text-tiny">
                {t("lottery.numberApplicantsQualifiedForGeneralPool", {
                  number: bucket.totalSubmittedApps,
                })}
              </p>
            </div>
            <hr className="mt-4" />
          </>
        ))}
    </div>
  )
}
