import { Heading, PageHeader, t } from "@bloom-housing/ui-components"
import React from "react"
import Markdown from "markdown-to-jsx"
import Link from "../../navigation/Link"
import "./BuyHeader.scss"

const BeforeApplying = () => (
  <div className="mb-8">
    <Heading className="mb-5" priority={2} underline>
      {t("saleDirectory.beforeApplying.title")}
    </Heading>
    <p>{t("saleDirectory.beforeApplying.makeSureYou")}</p>
    <ol className="numbered-list my-6">
      <li>{t("saleDirectory.beforeApplying.step1")}</li>
      <li>
        <Markdown>
          {t("saleDirectory.beforeApplying.step2", {
            url: "https://sfmohcd.org/homebuyer-program-eligibility",
          })}
        </Markdown>
      </li>
      <li>
        <Markdown>
          {t("saleDirectory.beforeApplying.step3", {
            url: "https://sfmohcd.org/homebuyer-application-requirements#education",
          })}
        </Markdown>
      </li>
      <li>
        <Markdown>
          {t("saleDirectory.beforeApplying.step4", { url: "https://sfmohcd.org/lender-list" })}
        </Markdown>
      </li>
      <li>{t("saleDirectory.beforeApplying.step5")}</li>
    </ol>
    <Markdown>
      {t("saleDirectory.beforeApplying.readFullList", {
        url: "https://sfmohcd.org/homebuyer-program-eligibility",
      })}
    </Markdown>
  </div>
)

const GetHelp = () => (
  <div className="md:bg-white md:p-4">
    <Heading className="mb-5" priority={2} underline>
      {t("saleDirectory.getHelp.title")}
    </Heading>
    <p className="mb-4">{t("saleDirectory.getHelp.somePeopleMayQualify")}</p>
    <p className="mb-4">{t("saleDirectory.getHelp.otherGroupsMayQualify")}</p>
    <p>
      <Link external={true} href="https://sfmohcd.org/loan-programs">
        {t("saleDirectory.getHelp.viewFullListOfPrograms")}
      </Link>
    </p>
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
        <BeforeApplying />
      </div>
      <div className="buy-header_right_col">
        <GetHelp />
      </div>
    </div>
  </PageHeader>
)

export default BuyHeader
