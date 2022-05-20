import React from "react"
import { Heading, t } from "@bloom-housing/ui-components"
import { RailsLotteryBucket } from "../../api/types/rails/listings/RailsLotteryBucket"
import "./ListingDetailsLotteryResultsRow.scss"

interface LotteryResultsRowProps {
  bucket: RailsLotteryBucket
}

export const ListingDetailsLotteryResultsRow = ({ bucket }: LotteryResultsRowProps) => {
  return (
    <div className="lottery-results-row border-b border-gray-450 flex mb-4 py-4">
      <div className="bg-blue-600 flex flex-col font-semibold h-full px-4 py-2 text-center text-white">
        <div className="rank-title uppercase">{t("lottery.rank")}</div>
        <div>{bucket.preferenceResults[0].preferenceRank}</div>
      </div>
      <div className="mx-4">
        <Heading
          className="font-sans font-semibold mb-1 text-tiny tracking-wide uppercase"
          priority={3}
        >
          {bucket.preferenceName === "generalLottery"
            ? t("lottery.generalPool")
            : bucket.preferenceName}
        </Heading>
        {bucket.preferenceName !== "generalLottery" && (
          <p className="mb-1 text-gray-900 text-tiny">
            {t("lottery.upToXUnitsAvailable", { units: bucket.unitsAvailable })}
          </p>
        )}
        {bucket.preferenceName === "generalLottery" && (
          <p className="mb-1 text-gray-900 text-tiny">{t("lottery.anyRemainingUnits")}</p>
        )}
        <p className="text-gray-700 text-tiny">
          {t("lottery.numberApplicantsQualifiedForPreference", {
            number: bucket.totalSubmittedApps,
          })}
        </p>
      </div>
    </div>
  )
}
