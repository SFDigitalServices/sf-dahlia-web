import { Heading, PageHeader, t } from "@bloom-housing/ui-components"
import React from "react"
import "./BuyHeader.scss"
import { BeforeApplyingForSale, BeforeApplyingType } from "../../components/BeforeApplyingForSale"
import { renderInlineMarkup } from "../../util/languageUtil"

const GetHelp = () => (
  <div className="md:bg-white md:p-4">
    <Heading styleType="underlineWeighted" className="mb-5" priority={2}>
      {t("listingsForSale.getHelp.helpWithDownpayment")}
    </Heading>
    <span>
      <p className="mb-4">
        {renderInlineMarkup(t("listingsForSale.getHelp.genericAssistanceInfo"))}
      </p>
    </span>
    <p className="mb-4">{t("listingsForSale.getHelp.genericAssistanceDescription")}</p>
  </div>
)
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
      <div className="buy-header_right_col">
        <GetHelp />
      </div>
    </div>
  </PageHeader>
)

export default BuyHeader
