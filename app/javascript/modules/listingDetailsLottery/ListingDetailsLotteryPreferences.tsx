import React from "react"
import { Heading, t } from "@bloom-housing/ui-components"
import type { RailsLotteryResult } from "../../api/types/rails/listings/RailsLotteryResult"
import { defaultOrMachineTranslationIfNotTranslated, renderMarkup } from "../../util/languageUtil"
import { LOTTERY_RANKING_VIDEO_URL } from "../constants"
import { RailsTranslations } from "../../api/types/rails/listings/RailsTranslation"

export interface ListingDetailsLotteryPreferencesProps {
  lotteryBucketsDetails: RailsLotteryResult
  machineTranslations: RailsTranslations
}

export const ListingDetailsLotteryPreferences = ({
  lotteryBucketsDetails,
  machineTranslations,
}: ListingDetailsLotteryPreferencesProps) => {
  return (
    <div className="text-sm">
      <header className="border-b border-gray-450 mb-4">
        <Heading styleType="underlineWeighted" className="mx-8" priority={2}>
          {t("lottery.housingPreferences")}
        </Heading>
        <div className="pb-4 text-gray-700 text-xs mx-8 translate">
          {renderMarkup(
            `${t("lottery.rankingOrderNote", {
              lotteryRankingVideoUrl: LOTTERY_RANKING_VIDEO_URL,
            })}`
          )}
        </div>
      </header>
      {lotteryBucketsDetails.lotteryBuckets
        .filter(
          (bucket) =>
            bucket.preferenceName !== "generalLottery" &&
            bucket.totalSubmittedApps &&
            bucket.unitsAvailable
        )
        .map((bucket, index, arr) => (
          <div key={bucket.preferenceOrder}>
            <div className="px-8 " key={bucket.preferenceOrder}>
              <Heading
                className="font-sans font-semibold text-xs tracking-wide uppercase"
                priority={3}
              >
                {defaultOrMachineTranslationIfNotTranslated(
                  machineTranslations,
                  `listings.lotteryPreference.${bucket.preferenceName}.title`,
                  bucket.preferenceName
                )}
              </Heading>
              <p className="text-sm">{t("lottery.upToXUnitsAvailable", bucket.unitsAvailable)}</p>
              <p className="text-gray-700 text-sm">
                {t("lottery.numberApplicantsQualifiedForPreference", bucket.totalSubmittedApps)}
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
                {t("lottery.numberApplicantsQualifiedForGeneralPool", bucket.totalSubmittedApps)}
              </p>
            </div>
            <hr className="mt-4" />
          </React.Fragment>
        ))}
    </div>
  )
}
