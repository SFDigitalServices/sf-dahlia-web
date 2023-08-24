import { Heading, PageHeader, t } from "@bloom-housing/ui-components"
import React from "react"
import "./BuyHeader.scss"
import { BeforeApplyingForSale, BeforeApplyingType } from "../../components/BeforeApplyingForSale"
import { renderInlineMarkup } from "../../util/languageUtil"

const GetHelp = () => (
  <div className="md:bg-white md:p-4">
    <Heading styleType="underlineWeighted" className="mb-5" priority={2}>
      {t("listingsForSale.buyHeader.getHelp.title")}
    </Heading>
    <p className="mb-4">{t("listingsForSale.buyHeader.getHelp.body1")}</p>
    <p className="mb-4">{t("listingsForSale.buyHeader.getHelp.body2")}</p>
    <p className="mb-4">{t("listingsForSale.buyHeader.getHelp.options.header")}</p>
    <ul className="list-disc ml-6">
      <li>{renderInlineMarkup(t("listingsForSale.buyHeader.getHelp.option.BMR"))}</li>
      <br />
      <li>{renderInlineMarkup(t("listingsForSale.buyHeader.getHelp.option.firmPrice"))}</li>
    </ul>
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
