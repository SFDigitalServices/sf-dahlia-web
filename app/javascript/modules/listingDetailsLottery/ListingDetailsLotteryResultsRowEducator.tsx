import React from "react"
import { Heading, t } from "@bloom-housing/ui-components"
import type { RailsLotteryBucket } from "../../api/types/rails/listings/RailsLotteryBucket"
import "./ListingDetailsLotteryResultsRow.scss"
import { defaultIfNotTranslated } from "../../util/languageUtil"

interface LotteryResultsRowProps {
  bucket: RailsLotteryBucket
}

export const ListingDetailsLotteryResultsRowEducator = ({ bucket }: LotteryResultsRowProps) => {
  return (
    <div className="lottery-results-row border-b border-gray-450 flex mb-4 px-8 pb-4">
      <div className="bg-blue-500 flex flex-col font-semibold h-full px-4 py-2 text-center text-white">
        <div className="rank-title uppercase">{t("lottery.rank")}</div>
        <div>{bucket.preferenceResults[0].preferenceRank}</div>
      </div>
      <div className="mx-4">
        <Heading
          className="font-sans font-semibold mb-1 text-sm tracking-wide uppercase"
          priority={3}
        >
          {bucket.preferenceName === "generalLottery"
            ? t("lottery.generalPool")
            : defaultIfNotTranslated(
                `listings.lotteryPreference.${bucket.preferenceName
                  // These are to accomodate Shirley Chisolm Village layered preferences
                  // They will be prepended with 'Tier 1', 'Tier 2', or nothing
                  // 'Tier 1' indicates an educator and another preference
                  // 'Tier 2' is someone who works for the school district and has another preference
                  // We don't want to display these values to users
                  .replace("Tier 1 ", "")
                  .replace("Tier 2 ", "")}.title`,
                bucket.preferenceName.replace("Tier 1 ", "").replace("Tier 2 ", "")
              )}
        </Heading>
        {bucket.preferenceName.includes("Tier 1")
          ? t("listings.lotteryPreference.sfusd.educators.shortTitle")
          : // eslint-disable-next-line unicorn/no-nested-ternary
          bucket.preferenceName.includes("Tier 2")
          ? t("listings.lotteryPreference.sfusd.allOtherEmployees.shortTitle")
          : t("listings.lotteryPreference.sfusd.generalPublic.shortTitle")}
        {bucket.preferenceName !== "generalLottery" && (
          <p className="mb-1 text-gray-950 text-sm">
            {t("lottery.upToXUnitsAvailable", { units: bucket.unitsAvailable })}
          </p>
        )}
        {bucket.preferenceName === "generalLottery" && (
          <p className="mb-1 text-gray-950 text-sm">{t("lottery.anyRemainingUnits")}</p>
        )}
        <p className="text-gray-700 text-sm">
          {t("lottery.numberApplicantsQualifiedForPreference", {
            number: bucket.totalSubmittedApps,
          })}
        </p>
      </div>
    </div>
  )
}
