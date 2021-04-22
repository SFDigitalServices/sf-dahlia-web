import React from "react"

import {
  ExygyFooter,
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
          currentLanguagePrefix={getRoutePrefix(currentPath) || "en"}
          items={langItems}
          onChangeLanguage={(newLangConfig) => {
            window.location.href = getNewLanguagePath(
              window.location.pathname,
              newLangConfig.prefix
            )
          }}
        />
        <SiteHeader
          skip={t("t.skipToMainContent")}
          logoSrc="/images/logo_glyph.svg"
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
        <FooterNav copyright={t("footer.cityCountyOfSf")}>
          <div />
        </FooterNav>
        <FooterSection className="bg-black" small>
          <ExygyFooter />
        </FooterSection>
      </SiteFooter>
      <SVG src="/images/icons.svg" />
    </div>
  )
}

export default Layout
