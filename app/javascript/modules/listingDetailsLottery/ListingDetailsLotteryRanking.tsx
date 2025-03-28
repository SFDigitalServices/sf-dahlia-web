import React from "react"
import { ExpandableContent, Heading, Icon, t } from "@bloom-housing/ui-components"
import { LOTTERY_RANKING_VIDEO_URL } from "../constants"
import { ListingDetailsLotteryResultsRow } from "./ListingDetailsLotteryResultsRow"
import Link from "../../navigation/Link"
import type { RailsLotteryResult } from "../../api/types/rails/listings/RailsLotteryResult"
import { getSfGovUrl, renderMarkup } from "../../util/languageUtil"

interface ListingDetailsLotteryRankingProps {
  lotteryResult: RailsLotteryResult
  listingIsEducator: boolean
  listingIsEducatorOne?: boolean
}

interface TooltipProps {
  text: string
}

const Tooltip = ({ text }: TooltipProps) => {
  return (
    <div className="bg-blue-100 border-b border-t border-gray-450 flex mb-4 py-4">
      <Icon className="mx-4" size="medium" symbol="info" />
      <p>{text}</p>
    </div>
  )
}
export const ListingDetailsLotteryRanking = ({
  lotteryResult,
  listingIsEducator,
  listingIsEducatorOne = false,
}: ListingDetailsLotteryRankingProps) => {
  const highestRankedBucket = lotteryResult?.lotteryBuckets.reduce((maxBucket, currBucket) => {
    if (!maxBucket && currBucket.preferenceOrder && currBucket.totalSubmittedApps > 0) {
      return currBucket
    }

    if (currBucket.preferenceOrder && currBucket.totalSubmittedApps > 0) {
      return currBucket.preferenceOrder < maxBucket.preferenceOrder ? currBucket : maxBucket
    }

    return maxBucket
  }, null)

  const preferenceBuckets = lotteryResult?.lotteryBuckets.filter((bucket) => {
    if (!bucket.preferenceResults[0]) {
      return false
    }
    if (listingIsEducatorOne && bucket.preferenceShortCode) {
      return bucket.preferenceShortCode.includes("T1") || bucket.preferenceShortCode.includes("T2")
    }

    return bucket.preferenceName !== "generalLottery" && bucket.preferenceResults[0].preferenceRank
  })
  const applicantSelectedForPreference = preferenceBuckets?.length > 0
  const applicantHasHighestRankedBucket = preferenceBuckets.some(
    (bucket) => bucket.preferenceName === highestRankedBucket.preferenceName
  )

  const generalLotteryBucket = lotteryResult?.lotteryBuckets.find(
    (bucket) => bucket.preferenceName === "generalLottery"
  )

  return (
    lotteryResult && (
      <div className="lottery-ranking text-sm">
        <header className="px-8">
          <Heading styleType="underlineWeighted" priority={2}>
            {applicantSelectedForPreference
              ? t("lottery.rankingTitle")
              : t("lottery.rankingTitle.noPreference")}
          </Heading>
          <div className="pb-4 text-gray-700 translate">
            {renderMarkup(
              `${t("lottery.rankingOrderNote", {
                lotteryRankingVideoUrl: LOTTERY_RANKING_VIDEO_URL,
              })}`
            )}
          </div>
        </header>

        {applicantSelectedForPreference && !applicantHasHighestRankedBucket && (
          <Tooltip text={t("lottery.rankingPreferenceConsiderationNote")} />
        )}
        {!applicantSelectedForPreference && (
          <Tooltip text={t("lottery.rankingPreferencesConsideredOverGeneralNote")} />
        )}
        {preferenceBuckets?.map((bucket) => (
          <ListingDetailsLotteryResultsRow
            bucket={bucket}
            key={bucket.preferenceName}
            listingIsEducator={listingIsEducator}
          />
        ))}
        {!applicantSelectedForPreference && (
          <ListingDetailsLotteryResultsRow
            bucket={generalLotteryBucket}
            listingIsEducator={listingIsEducator}
          />
        )}
        <div className="px-8">
          <ExpandableContent
            className="pb-4"
            strings={{
              readMore: t("lottery.nextStepsTitle"),
              readLess: t("lottery.nextStepsTitle"),
            }}
          >
            <div className="text-gray-700">
              <p className="mb-2">
                <Link
                  className="text-blue-700"
                  external={true}
                  href={getSfGovUrl("https://sf.gov/after-rental-housing-lottery")}
                  target="_blank"
                >
                  {t("lottery.nextStepsLearnMore")}
                </Link>
              </p>
              <p className="mb-2">{t("lottery.nextStepsP1")}</p>
              <p className="mb-2">{t("lottery.nextStepsP2")}</p>
              <p className="mb-2">{t("lottery.nextStepsP3")}</p>
            </div>
          </ExpandableContent>
        </div>
      </div>
    )
  )
}
