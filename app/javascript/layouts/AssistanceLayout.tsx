import React from "react"
import Layout from "./Layout"
import { PageHeader, SidebarBlock, t } from "@bloom-housing/ui-components"
import { getCurrentLanguage, renderInlineMarkup } from "../util/languageUtil"
import { ConfigContext } from "../lib/ConfigContext"

import "./AssistanceLayout.scss"
import { MailingListSignup } from "../components/MailingListSignup"

export const languageToSFGovMap = (lang: string) => {
  switch (lang) {
    case "es":
      return "https://sf.gov/es/node/55"
    case "tl":
      return "https://sf.gov/fil/node/55"
    case "zh":
      return "https://sf.gov/zh-hant/node/55"
    default:
      return "https://sf.gov/departments/mayors-office-housing-and-community-development"
  }
}

export interface Props {
  children: React.ReactNode
  title: string
  subtitle: string
}

const AssistanceLayout = ({ children, title, subtitle }: Props) => {
  const { getAssetPath } = React.useContext(ConfigContext)

  const lang = languageToSFGovMap(getCurrentLanguage(window.location.pathname))

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
          className="w-full md:w-1/3 text-gray-950 md:border-l border-t md:border-t-0 border-gray-450 border-b-0 p-6 mx-0"
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
              <div>
                {renderInlineMarkup(
                  t("assistance.contact.questionsAboutPrograms.contactWebsite", { lang })
                )}
              </div>
              <div className="mt-1">
                {renderInlineMarkup(t("assistance.contact.questionsAboutPrograms.contactEmail"))}
              </div>
              <div className="mt-1">
                {t("assistance.contact.questionsAboutPrograms.contactCall.title")}
                <ul className="list-disc list-inside mt-1">
                  <li>
                    English: <a href="tel:+14157015622">(415) 701-5622</a>
                  </li>
                  <li>
                    Español: <a href="tel:+14157015623">(415) 701-5623</a>
                  </li>
                  <li>
                    中文: <a href="tel:+14157015624">(415) 701-5624</a>
                  </li>
                  <li>
                    Filipino: <a href="tel:+14157015570">(415) 701-5570</a>
                  </li>
                </ul>
              </div>
            </div>
          </span>
        </SidebarBlock>
      </article>
      <span className="max-w-5xl m-auto w-full pb-8">
        <MailingListSignup />
      </span>
    </Layout>
  )
}

export default AssistanceLayout
