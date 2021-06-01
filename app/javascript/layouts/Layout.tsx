import React, { useContext } from "react"

import {
  FooterNav,
  FooterSection,
  LangItem,
  LanguageNav,
  LanguageNavLang,
  SiteFooter,
  SiteHeader,
  t,
} from "@bloom-housing/ui-components"
import Markdown from "markdown-to-jsx"
import Head from "next/head"
import SVG from "react-inlinesvg"

import { MainNav } from "../components/MainNav"
import { ConfigContext } from "../lib/ConfigContext"
import Link from "../navigation/Link"
import { LANGUAGE_CONFIGS } from "../util/languageUtil"
import { getDisclaimerPath, getPrivacyPolicyPath } from "../util/routeUtil"

export interface LayoutProps {
  children: React.ReactNode
}

const getLanguageItems = (): LanguageNavLang => {
  const languageItems: LangItem[] = []
  const languageCodes: string[] = []
  for (const item of Object.values(LANGUAGE_CONFIGS)) {
    languageItems.push({
      prefix: item.isDefault ? "" : item.prefix,
      get label() {
        return item.getLabel()
      },
    })

    languageCodes.push(item.prefix)
  }

  return {
    list: languageItems,
    codes: languageCodes,
  }
}

const langItems = getLanguageItems()

const Layout = (props: LayoutProps) => {
  const { getAssetPath } = useContext(ConfigContext)

  return (
    <div className="site-wrapper">
      <div className="site-content">
        <Head>
          <title>{t("t.dahliaSanFranciscoHousingPortal")}</title>
        </Head>
        <LanguageNav language={langItems} />
        <SiteHeader
          skip={t("t.skipToMainContent")}
          logoSrc={getAssetPath("logo-portal.png")}
          notice="This is a preview of our new website. We're just getting started. We'd love to get your feedback."
          title={t("t.dahliaSanFranciscoHousingPortal")}
        >
          <MainNav />
        </SiteHeader>
        <main data-testid="main-content-test-id" id="main-content">
          {props.children}
        </main>
      </div>

      <SiteFooter>
        <FooterSection>
          <img src={getAssetPath("logo-city.png")} alt="City &#38; County of San Francisco Logo" />
        </FooterSection>
        <FooterSection small>
          <p className="text-gray-500">
            <Markdown>
              {t("footer.dahliaDescription", {
                mohcdUrl: "https://sf.gov/mohcd",
              })}
            </Markdown>
          </p>
          <p className="text-sm mt-4 text-gray-500">
            <Markdown>
              {t("footer.inPartnershipWith", {
                sfdsUrl: "https://digitalservices.sfgov.org/",
                mayorUrl: "https://www.innovation.sfgov.org/",
              })}
            </Markdown>
          </p>
        </FooterSection>

        <FooterSection>
          <p className="text-tiny">
            {t("footer.forListingQuestions")} <br />
            {t("footer.forGeneralQuestions")}
          </p>
        </FooterSection>
        <FooterNav copyright={`© ${t("footer.cityCountyOfSf")}`}>
          <Link
            className="text-gray-500"
            href="https://airtable.com/shrw64DubWTQfRkdo"
            target="_blank"
          >
            {t("footer.giveFeedback")}
          </Link>
          <Link className="text-gray-500" href="mailto:sfhousinginfo@sfgov.org">
            {t("footer.contact")}
          </Link>
          <Link className="text-gray-500" href={getDisclaimerPath()}>
            {t("footer.disclaimer")}
          </Link>
          <Link className="text-gray-500" href={getPrivacyPolicyPath()}>
            {t("footer.privacyPolicy")}
          </Link>
        </FooterNav>
      </SiteFooter>
      <SVG src="/images/icons.svg" />
    </div>
  )
}

export default Layout
