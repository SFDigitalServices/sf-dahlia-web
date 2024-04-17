import React from "react"
import { Heading, t } from "@bloom-housing/ui-components"
import type { RailsLotteryResult } from "../../api/types/rails/listings/RailsLotteryResult"
import { defaultIfNotTranslated, renderMarkup } from "../../util/languageUtil"
import { preferenceNameHasVeteran } from "../../util/listingUtil"

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
      <p className="text-sm">{t("lottery.upToXUnitsAvailable", { units: unitsAvailable ?? 0 })}</p>
      {numVeteranApps ? (
        <>
          <p className="text-gray-700 text-sm">
            {t("lottery.numberApplicantsQualifiedForPreference.veteran", {
              number: numVeteranApps,
            })}
          </p>
          <p className="text-gray-700 text-sm">
            {t("lottery.numberApplicantsQualifiedForPreference.nonVeteran", {
              number: totalSubmittedApps,
            })}
          </p>
        </>
      ) : (
        <p className="text-gray-700 text-sm">
          {t("lottery.numberApplicantsQualifiedForPreference", {
            number: totalSubmittedApps,
          })}
        </p>
      )}
    </div>
    <hr className={lastPref ? "mt-4" : "my-4"} />
  </div>
)

export const ListingDetailsLotteryPreferencesEducator = ({
  lotteryBucketsDetails,
  isEducatorOne,
}: ListingDetailsLotteryPreferencesProps) => {
  const veteranAppsByPreferenceMap = {}
  lotteryBucketsDetails.lotteryBuckets
    .filter((lotteryBucket) => preferenceNameHasVeteran(lotteryBucket.preferenceName))
    .forEach((lotteryBucket) => {
      veteranAppsByPreferenceMap[lotteryBucket.preferenceShortCode] =
        lotteryBucket.totalSubmittedApps
    })

  return (
    <div className="text-sm">
      <header className="border-b border-gray-450 mb-4">
        <Heading styleType="underlineWeighted" className="mx-8" priority={2}>
          {t("lottery.housingPreferences.educator")}
        </Heading>
        <div className="pb-4 text-gray-700 text-xs mx-8 translate">
          {renderMarkup(
            `${t("lottery.rankingOrderNote", {
              lotteryRankingVideoUrl: "https://www.youtube.com/watch?v=4ZB35gagUl8",
            })}`
          )}
        </div>
        <div className="pb-4 text-gray-700 text-xs mx-8">
          {t("lottery.rankingOrderNote.veterans")}
        </div>
      </header>
      <header className="border-b border-gray-450 mb-4">
        <Heading styleType="underlineWeighted" className="mx-8 text-xs" priority={2}>
          {t("listings.lotteryPreference.sfusd.educators.title")}
        </Heading>
      </header>
      {lotteryBucketsDetails.lotteryBuckets
        .filter(
          (bucket) =>
            bucket.preferenceShortCode &&
            bucket.preferenceShortCode.includes("T1") &&
            !bucket.preferenceShortCode.includes("V") &&
            bucket.totalSubmittedApps
        )
        .map((bucket, index, arr) => (
          <LotteryPreferences
            unitsAvailable={bucket.unitsAvailable}
            totalSubmittedApps={bucket.totalSubmittedApps}
            preferenceName={bucket.preferenceName.replace("Tier 1 ", "")}
            numVeteranApps={
              veteranAppsByPreferenceMap[bucket.preferenceShortCode.replace("-", "-V-")] ?? null
            }
            lastPref={arr.length - 1 === index}
          />
        ))}
      <header className="border-b border-gray-450 my-4">
        <Heading styleType="underlineWeighted" className="mx-8 text-xs" priority={2}>
          {t("listings.lotteryPreference.sfusd.allOtherEmployees.title")}
        </Heading>
      </header>
      {lotteryBucketsDetails.lotteryBuckets
        .filter(
          (bucket) =>
            bucket.preferenceShortCode &&
            bucket.preferenceShortCode.includes("T2") &&
            !bucket.preferenceShortCode.includes("V") &&
            bucket.totalSubmittedApps
        )
        .map((bucket, index, arr) => (
          <LotteryPreferences
            unitsAvailable={bucket.unitsAvailable}
            totalSubmittedApps={bucket.totalSubmittedApps}
            preferenceName={bucket.preferenceName.replace("Tier 2 ", "")}
            numVeteranApps={
              veteranAppsByPreferenceMap[bucket.preferenceShortCode.replace("-", "-V-")] ?? null
            }
            lastPref={arr.length - 1 === index}
          />
        ))}
      {!isEducatorOne ?? (
        <>
          <header className="border-b border-gray-450 my-4">
            <Heading styleType="underlineWeighted" className="mx-8 text-xs" priority={2}>
              {t("lottery.generalPublic")}
            </Heading>
          </header>
          {lotteryBucketsDetails.lotteryBuckets
            .filter(
              (bucket) =>
                bucket.preferenceShortCode &&
                !bucket.preferenceShortCode.includes("T1") &&
                !bucket.preferenceShortCode.includes("T2") &&
                !bucket.preferenceShortCode.includes("V") &&
                bucket.totalSubmittedApps
            )
            .map((bucket, index, arr) => (
              <LotteryPreferences
                unitsAvailable={bucket.unitsAvailable}
                totalSubmittedApps={bucket.totalSubmittedApps}
                preferenceName={bucket.preferenceName}
                numVeteranApps={
                  veteranAppsByPreferenceMap[bucket.preferenceShortCode.replace("-", "-V-")] ?? null
                }
                lastPref={arr.length - 1 === index}
              />
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
        </>
      )}
    </div>
  )
}
