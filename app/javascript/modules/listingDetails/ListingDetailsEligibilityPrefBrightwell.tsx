import React from "react"
import { ListSection, t } from "@bloom-housing/ui-components"
import { Link } from "@bloom-housing/ui-seeds"
import { getSfGovUrl } from "../../util/languageUtil"

const ListingDetailsEligibilityPrefBrightwell = () => (
  <ListSection
    title={t("listings.lottery.title")}
    subtitle={
      <div className="space-y-4">
        <p>{t("listingsForSale.lotteryPreferences.lotteryPreferencesArePrograms")}</p>
        <p>
          <b>{t("listings.customListingType.educator.brightwell.preferences.part1")}</b>
          <br />
          {t("listings.customListingType.educator.brightwell.preferences.part2")}
        </p>
        <p>
          <Link
            className="text-blue-700"
            href={getSfGovUrl("https://www.sf.gov/learn-how-lottery-works-brightwell-west")}
            newWindowTarget
          >
            {t("listings.customListingType.educator.brightwell.preferences.part3")}
          </Link>
        </p>
      </div>
    }
  />
)

export default ListingDetailsEligibilityPrefBrightwell
