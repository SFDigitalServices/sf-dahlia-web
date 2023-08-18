import React from "react"
import { Heading, t } from "@bloom-housing/ui-components"
import type { RailsLotteryResult } from "../../api/types/rails/listings/RailsLotteryResult"
import { defaultIfNotTranslated, renderMarkup } from "../../util/languageUtil"

export interface ListingDetailsLotteryPreferencesProps {
  lotteryBucketsDetails: RailsLotteryResult
}

export const ListingDetailsLotteryPreferences = ({
  lotteryBucketsDetails,
}: ListingDetailsLotteryPreferencesProps) => {
  return (
    <div className="text-sm">
      <p className="px-8 pb-4 text-xs">{t("lottery.bucketsIntro")}</p>
      <header className="border-b border-gray-450 mb-4">
        <Heading styleType="underlineWeighted" className="mx-8" priority={2}>
          {t("lottery.housingPreferences")}
        </Heading>
        <p className="pb-4 text-gray-700 text-xs mx-8 translate">
          {renderMarkup(
            `${t("lottery.rankingOrderNote", {
              lotteryRankingVideoUrl: "https://www.youtube.com/watch?v=4ZB35gagUl8",
            })}`
          )}
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
                className="font-sans font-semibold text-xs tracking-wide uppercase"
                priority={3}
              >
                {defaultIfNotTranslated(
                  `listings.lotteryPreference.${bucket.preferenceName}.title`,
                  bucket.preferenceName
                )}
              </Heading>
              <p className="text-sm">
                {t("lottery.upToXUnitsAvailable", { units: bucket.unitsAvailable })}
              </p>
              <p className="text-gray-700 text-sm">
                {t("lottery.numberApplicantsQualifiedForPreference", {
                  number: bucket.totalSubmittedApps,
                })}
              </p>
            </div>
            <hr className={arr.length - 1 === index ? "mt-4" : "my-4"} />
          </div>
        ))}
      <div className="bg-gray-100 border-b mb-4 p-4">
        <hr className="border-b-4 border-primary" />
      </div>
      {lotteryBucketsDetails.lotteryBuckets
        .filter((bucket) => bucket.preferenceName === "generalLottery")
        .map((bucket) => (
          <React.Fragment key={bucket.preferenceOrder}>
            <div className="px-8">
              <Heading
                className="font-sans font-semibold text-sm tracking-wide uppercase"
                priority={3}
              >
                {t("lottery.generalPool")}
              </Heading>
              <p className="mb-1 text-sm">{t("lottery.anyRemainingUnits")}</p>
              <p className="text-gray-700 text-sm">
                {t("lottery.numberApplicantsQualifiedForGeneralPool", {
                  number: bucket.totalSubmittedApps,
                })}
              </p>
            </div>
            <hr className="mt-4" />
          </React.Fragment>
        ))}
    </div>
  )
}
