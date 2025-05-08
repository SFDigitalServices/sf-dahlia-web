import { Heading, PageHeader, t } from "@bloom-housing/ui-components"
import React from "react"
import "./BuyHeader.scss"
import { BeforeApplyingForSale, BeforeApplyingType } from "../../components/BeforeApplyingForSale"
import { renderInlineMarkup } from "../../util/languageUtil"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"

const DalpHeader = () => {
  return (
    <div className="md:bg-white md:p-4">
      <Heading styleType="underlineWeighted" className="mb-5" priority={2}>
        {t("saleDirectory.dalp.title")}
      </Heading>
      <p className="mb-4">{t("saleDirectory.dalp.content")}</p>
      <p className="font-bold">{t("saleDirectory.dalp.subtitle")}</p>
      <p className="mb-4">{t("saleDirectory.dalp.subcontent")}</p>
      <p className="mb-4">
        {renderInlineMarkup(
          t("saleDirectory.dalp.link", {
            url: "https://www.sf.gov/apply-downpayment-loan-buy-market-rate-home",
          })
        )}
      </p>
    </div>
  )
}

const BuyHeader = () => {
  const { unleashFlag: dalpDirectoryEnabled } = useFeatureFlag("temp.webapp.directory.dalp", false)
  const { unleashFlag: translationsReady } = useFeatureFlag(
    "temp.webapp.listings.sales.seeHomesForSale",
    false
  )
  return (
    <PageHeader className="buy-header">
      <div className="buy-header_columns">
        <Heading className="buy-header_title buy-header_left_col">
          {t("saleDirectory.title")}
        </Heading>
        <div className="mb-8 buy-header_right_col">
          {/* TODO: Switch this back to LinkButton or button once this issue is resolvedhttps://github.com/bloom-housing/bloom/issues/2324 */}
          <a href="#nav-bar-container" className="button is-primary is-fullwidth">
            {translationsReady
              ? t("saleDirectory.seeHomesForSale")
              : t("saleDirectory.seeTheListings")}
          </a>
        </div>
        <div className="buy-header_left_col">
          <BeforeApplyingForSale beforeApplyingType={BeforeApplyingType.DIRECTORY} />
        </div>
        {dalpDirectoryEnabled && (
          <div className="buy-header_right_col">
            <DalpHeader />
          </div>
        )}
      </div>
    </PageHeader>
  )
}

export default BuyHeader
