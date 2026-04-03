import React from "react"
import { Card, ListSection, t } from "@bloom-housing/ui-components"
import { renderInlineMarkup, getSfGovUrl } from "../../util/languageUtil"
import Link from "../../navigation/Link"

const ListingDetailsEligibilityCheckBrightwell = () => (
  <ListSection title={t("listings.customListingType.educator.eligibility.title")} subtitle="">
    <Card className="educator-eligibility">
      <Card.Section className="markdown">
        <div>
          <p>
            <b>{t("listings.customListingType.educator.brightwell.eligibility.part1")}</b>
          </p>
          <p>
            {renderInlineMarkup(
              t("listings.customListingType.educator.brightwell.eligibility.part2", {
                sfusdLink: "https://www.sfusd.edu/",
                cityCollegeLink: "https://www.ccsf.edu/",
              })
            )}
          </p>
          <p>
            <b>{t("listings.customListingType.educator.brightwell.eligibility.part3")}</b>
            <br />
            {t("listings.customListingType.educator.brightwell.eligibility.part4")}{" "}
            <Link
              className="text-blue-700"
              external={true}
              href={getSfGovUrl("https://www.sf.gov/learn-how-lottery-works-brightwell-west")}
              target="_blank"
            >
              {t("listings.customListingType.educator.brightwell.eligibility.part5")}
            </Link>
          </p>
        </div>
      </Card.Section>
    </Card>
  </ListSection>
)

export default ListingDetailsEligibilityCheckBrightwell
