import React from "react"
import Layout from "../../layouts/Layout"
import withAppSetup from "../../layouts/withAppSetup"
import { SidebarBlock, t } from "@bloom-housing/ui-components"
// import ConfigContext from "../../lib/ConfigContext"
import { renderInlineMarkup } from "../../util/languageUtil"

const AdditionalResources = () => {
  // const { getAssetPath } = useContext(ConfigContext)

  return (
    <Layout title={t("pageTitle.additionalResources")}>
      {/* <Hero
        title={"Additional Resources"}
        centered={false}
        className=""
        backgroundImage={getAssetPath("bg@1200.jpg")}
      >
        Get help with your application, find other services, and learn how the lottery works.
      </Hero> */}
      <article className="flex flex-wrap flex-col md:flex-row relative max-w-5xl m-auto w-full">
        <div className="w-full md:w-2/3">hey</div>
        <SidebarBlock
          className="w-full md:w-1/3 text-gray-950 md:border-l border-t md:border-t-0 border-gray-450 p-6 mx-0"
          title={t("footer.contact")}
        >
          <span className="text-gray-950">
            <p className="mb-4">
              <span className="font-semibold">
                {t("assistance.contact.questionsAboutListings.title1")}
              </span>
              <br /> {renderInlineMarkup(t("assistance.contact.questionsAboutListings.subtitle"))}
            </p>
            <p className="mb-4">
              <span className="font-semibold">{t("assistance.contact.helpLine.title1")}</span>
              <br /> {renderInlineMarkup(t("assistance.contact.helpLine.subtitle"))}
            </p>
            <p>
              <span className="font-semibold">
                {t("assistance.contact.questionsAboutPrograms.title1")}
              </span>
              <br />
              <span>
                {renderInlineMarkup(t("assistance.contact.questionsAboutPrograms.contactWebsite"))}
              </span>
              <div className="mt-1">
                {renderInlineMarkup(t("assistance.contact.questionsAboutPrograms.contactEmail"))}
              </div>
              <div className="mt-1">
                {t("assistance.contact.questionsAboutPrograms.contactCall.title")}
                <ul className="list-disc list-inside mt-1">
                  <li>English: (415) 701-5622</li>
                  <li>Españo: (415) 701-5623</li>
                  <li>中文: (415) 701-5624</li>
                  <li>Filipino: (415) 701-5570</li>
                </ul>
              </div>
            </p>
          </span>
        </SidebarBlock>
      </article>
    </Layout>
  )
}

export default withAppSetup(AdditionalResources)
