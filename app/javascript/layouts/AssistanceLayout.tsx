import React from "react"
import Layout from "./Layout"
import { PageHeader, SidebarBlock, t } from "@bloom-housing/ui-components"
import { renderInlineMarkup } from "../util/languageUtil"
import { ConfigContext } from "../lib/ConfigContext"

import "./AssistanceLayout.scss"

export interface Props {
  children: React.ReactNode
  title: string
  subtitle: string
}

const AssistanceLayout = ({ children, title, subtitle }: Props) => {
  const { getAssetPath } = React.useContext(ConfigContext)

  return (
    <Layout title={title}>
      <PageHeader
        title={title}
        subtitle={subtitle}
        inverse
        backgroundImage={getAssetPath("bg@1200.jpg")}
      />
      <article className="flex flex-wrap flex-col md:flex-row relative max-w-5xl m-auto w-full">
        <div className="w-full md:w-2/3" data-test-id="assistance-main-content">
          {children}
        </div>
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
            <div>
              <span className="font-semibold">
                {t("assistance.contact.questionsAboutPrograms.title1")}
              </span>
              <br />
              <span>
                {renderInlineMarkup(t("assistance.contact.questionsAboutPrograms.contactWebsite"))}
              </span>
              <span className="mt-1">
                {renderInlineMarkup(t("assistance.contact.questionsAboutPrograms.contactEmail"))}
              </span>
              <span className="mt-1">
                {t("assistance.contact.questionsAboutPrograms.contactCall.title")}
                <ul className="list-disc list-inside mt-1">
                  <li>English: (415) 701-5622</li>
                  <li>Españo: (415) 701-5623</li>
                  <li>中文: (415) 701-5624</li>
                  <li>Filipino: (415) 701-5570</li>
                </ul>
              </span>
            </div>
          </span>
        </SidebarBlock>
      </article>
    </Layout>
  )
}

export default AssistanceLayout
