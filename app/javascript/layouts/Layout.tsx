import React, { useContext } from "react"

import {
  FooterNav,
  FooterSection,
  LanguageNav,
  SiteFooter,
  SiteHeader,
  t,
} from "@sf-digital-services/ui-components"
import Markdown from "markdown-to-jsx"
import Head from "next/head"
import SVG from "react-inlinesvg"

import { MainNav } from "../components/MainNav"
import { ConfigContext } from "../lib/ConfigContext"
import { getRoutePrefix, LANGUAGE_CONFIGS } from "../util/languageUtil"
import { getNewLanguagePath } from "../util/routeUtil"

export interface LayoutProps {
  children: React.ReactNode
}

const Layout = (props: LayoutProps) => {
  const { getAssetPath } = useContext(ConfigContext)

  const langItems = Object.values(LANGUAGE_CONFIGS).map((item) => ({
    prefix: item.isDefault ? "" : item.prefix,
    label: item.getLabel(),
  }))

  const currentPath = window.location.pathname

  return (
    <div className="site-wrapper">
      <div className="site-content">
        <Head>
          <title>{t("t.dahliaSanFranciscoHousingPortal")}</title>
        </Head>
        <LanguageNav
          currentLanguagePrefix={getRoutePrefix(currentPath) || ""}
          items={langItems}
          onChangeLanguage={(newLangConfig) => {
            window.location.href = getNewLanguagePath(
              window.location.pathname,
              newLangConfig.prefix,
              window.location.search
            )
          }}
        />
        <SiteHeader
          skip={t("t.skipToMainContent")}
          logoSrc={getAssetPath("logo-portal.png")}
          notice="This is a preview of our new website. We're just getting started. We'd love to get your feedback."
          title={t("t.dahliaSanFranciscoHousingPortal")}
        >
          <MainNav />
        </SiteHeader>
        <main id="main-content">{props.children}</main>
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
          <a
            className="text-gray-500"
            href="https://airtable.com/shrw64DubWTQfRkdo"
            target="_blank"
          >
            {t("footer.giveFeedback")}
          </a>
          <a className="text-gray-500" href="mailto:sfhousinginfo@sfgov.org">
            {t("footer.contact")}
          </a>
          <a
            className="text-gray-500"
            href="https://www.acgov.org/government/legal.htm"
            target="_blank"
          >
            {t("footer.disclaimer")}
          </a>
          <a className="text-gray-500" href="/privacy">
            {t("footer.privacyPolicy")}
          </a>
        </FooterNav>
      </SiteFooter>
      <SVG src="/images/icons.svg" />
    </div>
  )
}

export default Layout
