import React from "react"
import { Heading, t } from "@bloom-housing/ui-components"
import type { RailsLotteryBucket } from "../../api/types/rails/listings/RailsLotteryBucket"
import "./ListingDetailsLotteryResultsRow.scss"
import { defaultIfNotTranslated } from "../../util/languageUtil"

interface LotteryResultsRowProps {
  bucket: RailsLotteryBucket
}

export const ListingDetailsLotteryResultsRow = ({ bucket }: LotteryResultsRowProps) => {
  return (
    <div className="lottery-results-row border-b border-gray-450 flex mb-4 px-8 py-4">
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
                `listings.lotteryPreference.${bucket.preferenceName}.title`,
                bucket.preferenceName
              )}
        </Heading>
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
