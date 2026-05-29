import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { ConfigContext } from "../../lib/ConfigContext"
import { MailingListSignup } from "../../components/MailingListSignup"
import { t, PageHeader } from "@bloom-housing/ui-components"
import { AppPages } from "../../util/routeUtil"
import {
  InformationalContent,
  InformationalDivider,
  InformationalSection,
  InformationalStack,
} from "../../components/informational/InformationalPageElements"

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
      <article className="info-template-container">
        <div className="info-template-main-content">
          <InformationalContent>
            <InformationalSection>
              <InformationalStack>
                <h2>{t("disclaimer.liabilityTitle")}</h2>
                <p>{t("disclaimer.liabilityP1")}</p>
              </InformationalStack>
            </InformationalSection>
            <InformationalDivider />
            <InformationalSection>
              <InformationalStack>
                <h2>{t("disclaimer.copyrightTitle")}</h2>
                <p>{t("disclaimer.copyrightP1")}</p>
              </InformationalStack>
            </InformationalSection>
            <InformationalDivider />
            <InformationalSection>
              <InformationalStack>
                <h2>{t("disclaimer.browserCompatibilityTitle")}</h2>
                <p>{t("disclaimer.browserCompatibilityP1")}</p>
              </InformationalStack>
            </InformationalSection>
          </InformationalContent>
        </div>
      </article>
      <span className="max-w-5xl m-auto w-full pb-8">
        <MailingListSignup />
      </span>
    </Layout>
  )
}

export default withAppSetup(Disclaimer, { pageName: AppPages.Disclaimer })
