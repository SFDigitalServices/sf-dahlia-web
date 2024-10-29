import { Heading, PageHeader, t } from "@bloom-housing/ui-components"
import React from "react"
import "./BuyHeader.scss"
import { BeforeApplyingForSale, BeforeApplyingType } from "../../components/BeforeApplyingForSale"

const BuyHeader = () => (
  <PageHeader className="buy-header">
    <div className="buy-header_columns">
      <Heading className="buy-header_title buy-header_left_col">{t("saleDirectory.title")}</Heading>
      <div className="mb-8 buy-header_right_col">
        {/* TODO: Switch this back to LinkButton or button once this issue is resolvedhttps://github.com/bloom-housing/bloom/issues/2324 */}
        <a href="#listing-results" className="button is-primary is-fullwidth">
          {t("saleDirectory.seeTheListings")}
        </a>
      </div>
      <div className="buy-header_left_col">
        <BeforeApplyingForSale beforeApplyingType={BeforeApplyingType.DIRECTORY} />
      </div>
    </div>
  </PageHeader>
)

export default BuyHeader
