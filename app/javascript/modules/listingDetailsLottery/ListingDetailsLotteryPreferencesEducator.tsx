import React from "react"
import { Heading, t } from "@bloom-housing/ui-components"
import type { RailsLotteryResult } from "../../api/types/rails/listings/RailsLotteryResult"
import { defaultIfNotTranslated, renderMarkup } from "../../util/languageUtil"
import { preferenceNameHasVeteran } from "../../util/listingUtil"
import { LOTTERY_RANKING_VIDEO_URL } from "../constants"
import { RailsLotteryBucket } from "../../api/types/rails/listings/RailsLotteryBucket"

export interface ListingDetailsLotteryPreferencesProps {
  lotteryBucketsDetails: RailsLotteryResult
  isEducatorOne: boolean
}
interface PreferencesProps {
  unitsAvailable: number
  totalSubmittedApps: number
  preferenceName: string
  numVeteranApps: number
  lastPref: boolean
}

const LotteryPreferences = ({
  unitsAvailable,
  totalSubmittedApps,
  preferenceName,
  numVeteranApps,
  lastPref,
}: PreferencesProps) => (
  <div>
    <div className="px-8">
      <Heading className="font-sans font-semibold text-xs tracking-wide uppercase" priority={3}>
        {defaultIfNotTranslated(
          `listings.lotteryPreference.${preferenceName}.title`,
          preferenceName
        )}
      </Heading>
      <p className="text-sm">{t("lottery.upToXUnitsAvailable", { units: unitsAvailable })}</p>
      {numVeteranApps > 0 ? (
        <>
          <p className="text-gray-700 text-sm">
            {t("lottery.numberApplicantsQualifiedForPreference.veteran", {
              number: numVeteranApps,
              plural: numVeteranApps > 1 ? "s" : "",
            })}
          </p>
          <p className="text-gray-700 text-sm">
            {t("lottery.numberApplicantsQualifiedForPreference.nonVeteran", {
              number: totalSubmittedApps,
              plural: totalSubmittedApps > 1 ? "s" : "",
            })}
          </p>
        </>
      ) : (
        <p className="text-gray-700 text-sm">
          {t("lottery.numberApplicantsQualifiedForPreference", {
            number: totalSubmittedApps,
            plural: totalSubmittedApps > 1 ? "s" : "",
          })}
        </p>
      )}
    </div>
    <hr className={lastPref ? "mt-4" : "my-4"} />
  </div>
)

const LotteryBucketHeader = ({ headerKey }: { headerKey: string }) => {
  return (
    <header className="border-b border-gray-450 mb-4">
      <Heading styleType="underlineWeighted" className="mx-8 text-xs" priority={2}>
        {t(headerKey)}
      </Heading>
    </header>
  )
}

const LotteryBucketsContent = ({
  buckets,
  veteranAppsByBucketMap,
  preferenceNameKey,
  lastPref,
}: {
  buckets: Array<RailsLotteryBucket>
  veteranAppsByBucketMap: object
  preferenceNameKey?: string
  lastPref?: boolean
}) => {
  return buckets.map((bucket, index, arr) => {
    const preferenceName = preferenceNameKey
      ? bucket.preferenceName.replace(preferenceNameKey, "")
      : bucket.preferenceName

    // We want to display the number of veteran applications under the associated preference bucket
    // so we will look up the veteran applications by the veteran preference short code that we derive
    // from the preference short code by adding in the 'V-'
    // e.g. The number of veteran applications for 'T1-COP' are stored in veteranAppsByBucketMap
    // under the key 'T1-V-COP', so we insert 'V-' using replace to get the veteran preference short code
    const veteransPreferenceShortCode = bucket.preferenceShortCode
    const numVeteranApps =
      veteranAppsByBucketMap[veteransPreferenceShortCode.replace("-", "-V-")] ?? 0

    return (
      <LotteryPreferences
        unitsAvailable={bucket.unitsAvailable}
        totalSubmittedApps={bucket.totalSubmittedApps}
        preferenceName={preferenceName}
        numVeteranApps={numVeteranApps}
        lastPref={lastPref && arr.length - 1 === index}
      />
    )
  })
}

export const ListingDetailsLotteryPreferencesEducator = ({
  lotteryBucketsDetails,
  isEducatorOne,
}: ListingDetailsLotteryPreferencesProps) => {
  // First, map all the veteran buckets to their corresponding educator bucket
  const veteranAppsByBucketMap = {}
  lotteryBucketsDetails.lotteryBuckets
    .filter((lotteryBucket) => preferenceNameHasVeteran(lotteryBucket.preferenceName))
    .forEach((lotteryBucket) => {
      // stores the number of veteran applications under the preference short code
      // e.g. The code for the veteran tier 1 cop bucket is 'T1-V-COP' - when we
      // later query for the veteran applications associated with the 'T1-COP' bucket
      // we will insert 'V-' to 'T1-COP' to get the lookup key
      veteranAppsByBucketMap[lotteryBucket.preferenceShortCode] = lotteryBucket.totalSubmittedApps
    })

  console.log(veteranAppsByBucketMap)
  // Then, get all the tier 1 educator buckets, excluding the tier 1 veteran buckets
  const tier1EducatorBucketWithoutVeteran = lotteryBucketsDetails.lotteryBuckets.filter(
    (bucket) =>
      bucket.preferenceShortCode &&
      bucket.preferenceShortCode.includes("T1") &&
      !bucket.preferenceShortCode.includes("V") &&
      bucket.totalSubmittedApps
  )

  // Then, get all the tier 2 educator buckets, excluding the tier 1 veteran buckets
  const tier2EducatorBucketWithoutVeteran = lotteryBucketsDetails.lotteryBuckets.filter(
    (bucket) =>
      bucket.preferenceShortCode &&
      bucket.preferenceShortCode.includes("T2") &&
      !bucket.preferenceShortCode.includes("V") &&
      bucket.totalSubmittedApps
  )

  // Then, get all the other non-educator buckets, excluding the veteran buckets
  // This only applies for SCV 2 & 3 (SCV 1 only allows educators to apply)
  const nonEducatorsWithoutVeterans = lotteryBucketsDetails.lotteryBuckets.filter(
    (bucket) =>
      bucket.preferenceShortCode &&
      !bucket.preferenceShortCode.includes("T1") &&
      !bucket.preferenceShortCode.includes("T2") &&
      !bucket.preferenceShortCode.includes("V") &&
      bucket.totalSubmittedApps
  )

  // Then, get the general lottery bucket
  // This only applies for SCV 2 & 3 (SCV 1 only allows educators to apply)
  const generalLottery = lotteryBucketsDetails.lotteryBuckets.filter(
    (bucket) => bucket.preferenceName === "generalLottery"
  )

  return (
    <div className="text-sm">
      <header className="border-b border-gray-450 mb-4">
        <Heading styleType="underlineWeighted" className="mx-8" priority={2}>
          {t("lottery.housingPreferences.educator")}
        </Heading>
        <div className="pb-4 text-gray-700 text-xs mx-8 translate">
          {renderMarkup(
            `${t("lottery.rankingOrderNote", {
              lotteryRankingVideoUrl: LOTTERY_RANKING_VIDEO_URL,
            })}`
          )}
        </div>
        <div className="pb-4 text-gray-700 text-xs mx-8">
          {t("lottery.rankingOrderNote.veterans")}
        </div>
      </header>
      <LotteryBucketHeader headerKey="listings.lotteryPreference.sfusd.educators.title" />
      <LotteryBucketsContent
        buckets={tier1EducatorBucketWithoutVeteran}
        veteranAppsByBucketMap={veteranAppsByBucketMap}
        preferenceNameKey="Tier 1 "
      />
      <LotteryBucketHeader headerKey="listings.lotteryPreference.sfusd.allOtherEmployees.title" />
      <LotteryBucketsContent
        buckets={tier2EducatorBucketWithoutVeteran}
        veteranAppsByBucketMap={veteranAppsByBucketMap}
        preferenceNameKey="Tier 2 "
        lastPref={isEducatorOne}
      />
      {!isEducatorOne && (
        <>
          <LotteryBucketHeader headerKey="lottery.generalPublic" />
          <LotteryBucketsContent
            buckets={nonEducatorsWithoutVeterans}
            veteranAppsByBucketMap={veteranAppsByBucketMap}
            lastPref
          />
          <div className="bg-gray-100 border-b mb-4 p-4">
            <hr className="border-b-4 border-primary" />
          </div>
          {generalLottery.map((bucket) => (
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
        </>
      )}
    </div>
  )
}
