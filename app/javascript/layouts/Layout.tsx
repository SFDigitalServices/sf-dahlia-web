import React from "react"

import {
  FooterNav,
  FooterSection,
  LanguageNav,
  LocalizedLink,
  setSiteAlertMessage,
  SiteFooter,
  SiteHeader,
  t,
  UserNav,
} from "@sf-digital-services/ui-components"
import Markdown from "markdown-to-jsx"
import Head from "next/head"
import SVG from "react-inlinesvg"

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
  assetPaths: unknown
}

const signOut = () => {
  console.log("signOut")
}

const Layout = (props: LayoutProps) => {
  // TODO: get these from auth provider
  const signedIn = false

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
          logoSrc={props.assetPaths["logo-portal.png"]}
          notice="This is a preview of our new website. We're just getting started. We'd love to get your feedback."
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
          <ul className="inline-list">
            <li className="border-white border-r-2 px-10 font-semibold">
              <a href="/es/welcome-spanish">Bienvenido</a>
            </li>
            <li className="border-white border-r-2 px-10 font-semibold">
              <a href="/zh/welcome-chinese">歡迎</a>
            </li>
            <li className="px-10 font-semibold">
              <a href="/tl/welcome-filipino">Maligayang pagdating</a>
            </li>
          </ul>
        </FooterSection>
        <FooterSection>
          <img src={props.assetPaths["logo-city.png"]} />
        </FooterSection>
        <FooterSection small>
          <Markdown options={{ disableParsingRawHTML: false }}>
            {t("footer.dahliaDescription", {
              mohcdUrl: "http://sf-moh.org",
              sfdsUrl: "https://digitalservices.sfgov.org/",
              mayorUrl: "https://www.innovation.sfgov.org/",
            })}
          </Markdown>
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
          <a href="https://heapanalytics.com/?utm_source=badge" target="_blank" rel="nofollow">
            <img
              src={props.assetPaths["heap.png"]}
              style={{ width: "108px", height: "41px" }}
              alt="Heap | Mobile and Web Analytics"
            />
          </a>
        </FooterNav>
      </SiteFooter>
      <SVG src="/images/icons.svg" />
    </div>
  )
}

export default Layout
