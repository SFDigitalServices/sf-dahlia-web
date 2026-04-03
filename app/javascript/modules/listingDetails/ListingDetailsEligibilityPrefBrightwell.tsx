import React from "react"
import { ListSection, t } from "@bloom-housing/ui-components"
import { getSfGovUrl } from "../../util/languageUtil"
import Link from "../../navigation/Link"

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
            external={true}
            href={getSfGovUrl("https://www.sf.gov/learn-how-lottery-works-brightwell-west")}
            target="_blank"
          >
            {t("listings.customListingType.educator.brightwell.preferences.part3")}
          </Link>
        </p>
      </div>
    }
  />
)

export default ListingDetailsEligibilityPrefBrightwell
