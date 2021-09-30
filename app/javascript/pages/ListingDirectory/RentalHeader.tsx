import { LinkButton, PageHeader, t } from "@bloom-housing/ui-components"
import React from "react"
import { getEligibilityEstimatorLink, getHelpCalculatingIncomeLink } from "../../util/routeUtil"
import Markdown from "markdown-to-jsx"

const RentalHeader = () => (
  <PageHeader title={t("rentalDirectory.title")} subtitle={t("rentalDirectory.ifYouTellUs")}>
    <p className="mt-8 mb-2">
      <LinkButton href={getEligibilityEstimatorLink()}>
        {t("rentalDirectory.findMatchingListings")}
      </LinkButton>
    </p>
    <Markdown className="text-sm">
      {t("rentalDirectory.orGetHelpCalculating", { incomeLink: getHelpCalculatingIncomeLink() })}
    </Markdown>
  </PageHeader>
)

export default RentalHeader
