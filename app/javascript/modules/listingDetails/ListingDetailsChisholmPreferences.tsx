import React from "react"
import { ListSection, t } from "@bloom-housing/ui-components"
import { renderInlineMarkup } from "../../util/languageUtil"

export const ListingDetailsChisholmPreferences = () => (
  <ListSection
    title={t("listings.lottery.title")}
    subtitle={
      <div className="space-y-4">
        <p>{t("listings.customListingType.educator.preferences.part1")}</p>
        <p>
          {renderInlineMarkup(t("listings.customListingType.educator.preferences.part2"), "<b>")}
          <br />
          {t("listings.customListingType.educator.preferences.part3")}
        </p>
        <ul className="list-disc ml-7">
          <li>
            {renderInlineMarkup(
              t("listings.customListingType.educator.preferences.part4a", {
                chisholmLink: "https://sf.gov/apply-shirley-chisholm-village-housing",
              })
            )}
          </li>
          <li>
            {renderInlineMarkup(
              t("listings.customListingType.educator.preferences.part4b", {
                preferencesLink:
                  "https://sf.gov/information/learn-about-housing-lottery-preference-programs",
              })
            )}
          </li>
        </ul>
      </div>
    }
  />
)
