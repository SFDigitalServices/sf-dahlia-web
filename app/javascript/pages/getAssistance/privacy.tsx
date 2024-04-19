import React from "react"
import withAppSetup from "../../layouts/withAppSetup"
import Layout from "../../layouts/Layout"
import { t, PageHeader } from "@bloom-housing/ui-components"
import { renderMarkup } from "../../util/languageUtil"
import { MailingListSignup } from "../../components/MailingListSignup"
import { ConfigContext } from "../../lib/ConfigContext"

const Privacy = () => {
  const { getAssetPath } = React.useContext(ConfigContext)
  return (
    <Layout title={t("pageTitle.privacy")}>
      <PageHeader
        title={t("pageTitle.privacy")}
        subtitle={t("privacyPolicy.intro")}
        inverse
        backgroundImage={getAssetPath("bg@1200.jpg")}
      />
      {
        <article className="flex flex-wrap relative max-w-5xl m-auto w-full">
          <div className="w-full md:w-2/3" data-test-id="assistance-main-content">
            <div className="space-y-4 p-6 md:py-11 md:pr-6 lg:pl-0">
              <h2>{t("privacyPolicy.infoCollectionTitle")}</h2>
              <ul className="list-disc ml-7 space-y-2.5">
                <li>{t("privacyPolicy.infoCollectionP1")}</li>
                <li>{t("privacyPolicy.infoCollectionP2")}</li>
                <li>{t("privacyPolicy.infoCollectionP3")}</li>
                <li>{t("privacyPolicy.infoCollectionP4")}</li>
              </ul>
            </div>
            <div className="md:pr-11 md:pl-0">
              <hr />
            </div>
            <div className="space-y-4 p-6 md:py-11 md:pr-11 lg:pl-0">
              <h2>{t("privacyPolicy.infoYouProvideTitle")}</h2>
              <ul className="list-disc ml-7 space-y-2.5">
                <li>{t("privacyPolicy.infoYouProvideP1")}</li>
                <li>{t("privacyPolicy.infoYouProvideP2")}</li>
                <li>{t("privacyPolicy.infoYouProvideP3")}</li>
              </ul>
            </div>
            <div className="md:pr-11 md:pl-0">
              <hr />
            </div>
            <div className="space-y-4 p-6 md:py-11 md:pr-11 lg:pl-0">
              <h2>{t("privacyPolicy.cookiesTitle")}</h2>
              <ul className="list-disc ml-7 space-y-2.5">
                <li>{t("privacyPolicy.cookiesP1")}</li>
                <li>{t("privacyPolicy.cookiesP2")}</li>
              </ul>
            </div>
            <div className="md:pr-11 md:pl-0">
              <hr />
            </div>
            <div className="space-y-4 p-6 md:py-11 md:pr-11 lg:pl-0">
              <h2>{t("privacyPolicy.infoSharingTitle")}</h2>
              <ul className="list-disc ml-7">
                <li>{t("privacyPolicy.infoSharingP1")}</li>
              </ul>
            </div>
            <div className="md:pr-11 md:pl-0">
              <hr />
            </div>
            <div className="space-y-4 p-6 md:py-11 md:pr-11 lg:pl-0">
              <h2>{t("privacyPolicy.analyticsTitle")}</h2>
              <div>
                {renderMarkup(
                  `${t("privacyPolicy.analyticsP1", {
                    termsLink:
                      '<a href="http://www.google.com/analytics/terms/us.html" target="_blank">',
                    privacyLink:
                      '<a href="http://www.google.com/policies/privacy/" target="_blank">',
                    optOutLink:
                      '<a href="https://tools.google.com/dlpage/gaoptout?hl=en" target="_blank">',
                    linkEnd: "</a>",
                  })}`
                )}
              </div>
            </div>
            <div className="md:pr-11 md:pl-0">
              <hr />
            </div>
            <div className="space-y-4 p-6 md:py-11 md:pr-11 lg:pl-0">
              <h2>{t("privacyPolicy.linksTitle")}</h2>
              <ul className="list-disc ml-7 space-y-2.5">
                <li>{t("privacyPolicy.linksP1")}</li>
                <li>{t("privacyPolicy.linksP2")}</li>
                <li>{t("privacyPolicy.linksP3")}</li>
              </ul>
            </div>
            <div className="md:pr-11 md:pl-0">
              <hr />
            </div>
            <div className="space-y-4 p-6 md:py-11 md:pr-11 lg:pl-0">
              <h2>{t("privacyPolicy.siteSecurityTitle")}</h2>
              <ul className="list-disc ml-7 space-y-2.5">
                <li>{t("privacyPolicy.siteSecurityP1")}</li>
                <li>{t("privacyPolicy.siteSecurityP2")}</li>
              </ul>
            </div>
            <div className="md:pr-11 md:pl-0">
              <hr />
            </div>
            <div className="space-y-4 p-6 md:py-11 md:pr-11 lg:pl-0">
              <h2>{t("privacyPolicy.policyChangesTitle")}</h2>
              <ul className="list-disc ml-7">
                <li>{t("privacyPolicy.policyChangesP1")}</li>
              </ul>
            </div>
            <div className="md:pr-11 md:pl-0">
              <hr />
            </div>
            <div className="space-y-4 p-6 md:py-11 md:pr-11 lg:pl-0">
              <h2>{t("privacyPolicy.questionsTitle")}</h2>
              <div>
                {renderMarkup(
                  `${t("privacyPolicy.questionsP1", {
                    telLink: '<a href="tel:4157015500">' + t("415-701-5500") + "</a>",
                    emailLink:
                      '<a href="mailto:sfhousinginfo@sfgov.org">' +
                      t("privacyPolicy.contactEmail") +
                      "</a>",
                  })}`
                )}
              </div>
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

export default withAppSetup(Privacy)
