import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { ConfigContext } from "../../lib/ConfigContext"
import { MailingListSignup } from "../../components/MailingListSignup"
import { t, PageHeader } from "@bloom-housing/ui-components"

const Disclaimer = () => {
  const { getAssetPath } = React.useContext(ConfigContext)
  return (
    <Layout title={t("pageTitle.disclaimer")}>
      <PageHeader
        title={t("pageTitle.disclaimer")}
        subtitle={t("disclaimer.intro")}
        inverse
        backgroundImage={getAssetPath("bg@1200.jpg")}
      />
      {
        <article className="flex flex-wrap relative max-w-5xl m-auto w-full">
          <div className="w-full md:w-2/3">
            <div className="space-y-4 p-6 md:py-11 md:pr-6 lg:pl-0">
              <h2>{t("disclaimer.liabilityTitle")}</h2>
              <p>{t("disclaimer.liabilityP1")}</p>
            </div>
            <div className="md:pr-11 md:pl-0">
              <hr />
            </div>
            <div className="space-y-4 p-6 md:py-11 md:pr-6 lg:pl-0">
              <h2>{t("disclaimer.copyrightTitle")}</h2>
              <p>{t("disclaimer.copyrightP1")}</p>
            </div>
            <div className="md:pr-11 md:pl-0">
              <hr />
            </div>
            <div className="space-y-4 p-6 md:py-11 md:pr-11 lg:pl-0">
              <h2>{t("disclaimer.browserCompatibilityTitle")}</h2>
              <p>{t("disclaimer.browserCompatibilityP1")}</p>
            </div>
          </div>
        </article>
      }
      <span className="max-w-5xl m-auto w-full pb-8">
        <MailingListSignup />
      </span>
    </Layout>
  )
}

export default withAppSetup(Disclaimer)
