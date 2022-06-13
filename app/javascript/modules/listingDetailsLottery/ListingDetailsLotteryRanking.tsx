import React from "react"
import { ExpandableContent, Heading, Icon, t } from "@bloom-housing/ui-components"
import { PREFERENCES } from "../constants"
import { ListingDetailsLotteryResultsRow } from "./ListingDetailsLotteryResultsRow"
import { RailsLotteryResult } from "../../api/types/rails/listings/RailsLotteryResult"

interface ListingDetailsLotteryRankingProps {
  lotteryResult: RailsLotteryResult
}

interface TooltipProps {
  text: string
}

const Tooltip = ({ text }: TooltipProps) => {
  return (
    <div className="bg-blue-200 border-b border-gray-450 flex mb-4 py-4">
      <Icon className="mr-4" size="medium" symbol="info" />
      <p>{text}</p>
    </div>
  )
}
export const ListingDetailsLotteryRanking = ({
  lotteryResult,
}: ListingDetailsLotteryRankingProps) => {
  const preferenceBuckets = lotteryResult?.lotteryBuckets.filter((bucket) => {
    if (!bucket.preferenceResults[0]) {
      return false
    }
    return bucket.preferenceName !== "generalLottery" && bucket.preferenceResults[0].preferenceRank
  })
  const applicantSelectedForPreference = preferenceBuckets?.length > 0
  const applicantHasCertOfPreference = preferenceBuckets.some(
    (bucket) => bucket.preferenceName === PREFERENCES.certificateOfPreference
  )
  const generalLotteryBucket = lotteryResult?.lotteryBuckets.find(
    (bucket) => bucket.preferenceName === "generalLottery"
  )

  return (
    lotteryResult && (
      <div className="lottery-ranking text-tiny">
        {applicantSelectedForPreference && (
          <header>
            <Heading className="text-caps-underline" priority={2}>
              {t("lottery.rankingTitle")}
            </Heading>
            <p className="border-b border-gray-450 pb-4 text-gray-700">
              {t("lottery.rankingOrderNote")}
            </p>
          </header>
        )}
        {applicantSelectedForPreference && !applicantHasCertOfPreference && (
          <Tooltip text={t("lottery.rankingPreferenceConsiderationNote")} />
        )}
        {!applicantSelectedForPreference && (
          <Tooltip text={t("lottery.rankingPreferencesConsideredOverGeneralNote")} />
        )}
        {preferenceBuckets?.map((bucket) => (
          <ListingDetailsLotteryResultsRow bucket={bucket} key={bucket.preferenceName} />
        ))}
        {!applicantSelectedForPreference && (
          <ListingDetailsLotteryResultsRow bucket={generalLotteryBucket} />
        )}
        <ExpandableContent
          strings={{ readMore: t("label.readMore"), readLess: t("label.readLess") }}
        >
          <div className="text-gray-700">
            <p className="mb-2">{t("lottery.nextStepsP1")}</p>
            <p className="mb-2">{t("lottery.nextStepsP2")}</p>
            <p className="mb-2">{t("lottery.nextStepsP3")}</p>
          </div>
        </ExpandableContent>
      </div>
    )
  )
}
