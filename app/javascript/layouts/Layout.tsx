import React, { useContext } from "react"

import {
  AlertBox,
  FooterNav,
  FooterSection,
  LanguageNav,
  LocalizedLink,
  setSiteAlertMessage,
  SiteFooter,
  SiteHeader,
  t,
  UserNav,
  AlertTypes,
} from "@sf-digital-services/ui-components"
import Markdown from "markdown-to-jsx"
import Head from "next/head"
import SVG from "react-inlinesvg"

import { ConfigContext } from "../lib/ConfigContext"
import { getRoutePrefix, LANGUAGE_CONFIGS } from "../util/languageUtil"
import {
  getAssistancePath,
  getFavoritesPath,
  getMyAccountSettingsPath,
  getMyAccountPath,
  getMyApplicationsPath,
  getRentalDirectoryPath,
  getSaleDirectoryPath,
  getNewLanguagePath,
} from "../util/routeUtil"

export interface LayoutProps {
  children: React.ReactNode
}

const signOut = () => {
  console.log("signOut")
}

const Layout = (props: LayoutProps) => {
  // TODO: get these from auth provider
  const signedIn = false
  const { getAssetPath } = useContext(ConfigContext)

  const langItems = Object.values(LANGUAGE_CONFIGS).map((item) => ({
    prefix: item.isDefault ? "" : item.prefix,
    label: item.getLabel(),
  }))

  const currentPath = window.location.pathname

  let notice = null
  console.log("banner", process.env.SHOW_RESEARCH_BANNER)
  if (process.env.SHOW_RESEARCH_BANNER) {
    notice = (
      <Markdown>
        {t("nav.researchFeedback", { researchUrl: process.env.RESEARCH_FORM_URL })}
      </Markdown>
    )
  }
  let topAlert = null
  if (process.env.TOP_MESSAGE) {
    topAlert = (
      <AlertBox type={(process.env.TOP_MESSAGE_TYPE as AlertTypes) || "alert"} inverted>
        <Markdown>{process.env.TOP_MESSAGE}</Markdown>
      </AlertBox>
    )
  }

  return (
    <div className="site-wrapper">
      <div className="site-content">
        <Head>
          <title>{t("t.dahliaSanFranciscoHousingPortal")}</title>
        </Head>
        {topAlert}
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
          notice={notice}
          title={t("t.dahliaSanFranciscoHousingPortal")}
        >
          <a
            data-testid="nav-button--rent"
            href={getRentalDirectoryPath(currentPath)}
            className="navbar-item"
          >
            {t("nav.rent")}
          </a>
          <a
            data-testid="nav-button--buy"
            href={getSaleDirectoryPath(currentPath)}
            className="navbar-item"
          >
            {t("nav.buy")}
          </a>
          <a
            data-testid="nav-button--favorites"
            href={getFavoritesPath(currentPath)}
            className="navbar-item"
          >
            {t("nav.myFavorites")}
          </a>
          <a
            data-testid="nav-button--assistance"
            href={getAssistancePath(currentPath)}
            className="navbar-item"
          >
            {t("nav.getAssistance")}
          </a>
          <UserNav
            signedIn={signedIn}
            signOut={() => {
              setSiteAlertMessage(t(`signIn.signedOutSuccessfully`), "notice")
              // await router.push("/sign-in")
              signOut()
              window.scrollTo(0, 0)
            }}
          >
            <LocalizedLink href={getMyAccountPath(currentPath)} className="navbar-item">
              {t("nav.myDashboard")}
            </LocalizedLink>
            <LocalizedLink href={getMyApplicationsPath(currentPath)} className="navbar-item">
              {t("nav.myApplications")}
            </LocalizedLink>
            <LocalizedLink href={getMyAccountSettingsPath(currentPath)} className="navbar-item">
              {t("nav.accountSettings")}
            </LocalizedLink>
          </UserNav>
        </SiteHeader>
        <main id="main-content">{props.children}</main>
      </div>

      <SiteFooter>
        <FooterSection>
          <img src={getAssetPath("logo-city.png")} />
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
      <SVG src={getAssetPath("icons.svg")} />
    </div>
  )
}

export default Layout
