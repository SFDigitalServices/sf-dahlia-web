import React from "react"
import { ListSection, t } from "@bloom-housing/ui-components"
import { renderInlineMarkup, getSfGovUrl } from "../../util/languageUtil"

export const ListingDetailsChisholmPreferences = ({
  isEducatorOne,
}: {
  isEducatorOne: boolean
}) => (
  <ListSection
    title={t("listings.lottery.title")}
    subtitle={
      <div className="space-y-4">
        <p>{t("listings.customListingType.educator.preferences.part1")}</p>
        <p>
          {renderInlineMarkup(t("listings.customListingType.educator.preferences.part2"), "<b>")}
          <br />
          {isEducatorOne
            ? t("listings.customListingType.educator.preferences.part3")
            : t("listings.customListingType.educator.preferences.part3.scv2")}
        </p>
        <ul className="list-disc ml-7">
          <li>
            {renderInlineMarkup(
              t("listings.customListingType.educator.preferences.part4a", {
                chisholmLotteryLink: getSfGovUrl(
                  "https://sf.gov/information/learn-how-lottery-works-shirley-chisholm-village",
                  10493
                ),
              })
            )}
          </li>
          <li>
            {renderInlineMarkup(
              t("listings.customListingType.educator.preferences.part4b", {
                preferencesLink: getSfGovUrl(
                  "https://sf.gov/information/learn-about-housing-lottery-preference-programs",
                  3274
                ),
              })
            )}
          </li>
        </ul>
      </div>
    }
  />
)
