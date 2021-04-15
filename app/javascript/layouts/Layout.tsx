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

import { getCurrentLanguagePrefix, getLanguageOptions } from "../util/languageUtil"
import {
  getAssistancePath,
  getFavoritesPath,
  getMyAccountSettingsPath,
  getMyDashboardPath,
  getMyApplicationsPath,
  getRentalDirectoryPath,
  getSaleDirectoryPath,
  getNewLanguagePath,
} from "../util/routeUtil"

export interface LayoutProps {
  children: React.ReactNode
}
const Layout = (props: LayoutProps) => {
  // TODO: get these from auth provider
  const signedIn = false
  const signOut = () => {
    console.log("signOut")
  }

  return (
    <div className="site-wrapper">
      <div className="site-content">
        <Head>
          <title>{t("t.dahlia_san_francisco_housing_portal")}</title>
        </Head>
        <LanguageNav
          currentLanguagePrefix={getCurrentLanguagePrefix() || "en"}
          items={getLanguageOptions()}
          onChangeLanguage={(newLangConfig) => {
            window.location.href = getNewLanguagePath(newLangConfig.prefix)
          }}
        />
        <SiteHeader
          skip={t("nav.skip")}
          logoSrc="/images/logo_glyph.svg"
          notice="This is a preview of our new website. We're just getting started. We'd love to get your feedback."
          title={t("t.dahlia_san_francisco_housing_portal")}
        >
          <a data-testid="nav-button--rent" href={getRentalDirectoryPath()} className="navbar-item">
            {t("nav.rent")}
          </a>
          <a data-testid="nav-button--buy" href={getSaleDirectoryPath()} className="navbar-item">
            {t("nav.buy")}
          </a>
          <a data-testid="nav-button--favorites" href={getFavoritesPath()} className="navbar-item">
            {t("nav.my_favorites")}
          </a>
          <a
            data-testid="nav-button--assistance"
            href={getAssistancePath()}
            className="navbar-item"
          >
            {t("nav.get_assistance")}
          </a>
          <UserNav
            signedIn={signedIn}
            signOut={() => {
              setSiteAlertMessage(t(`authentication.signOut.success`), "notice")
              // await router.push("/sign-in")
              signOut()
              window.scrollTo(0, 0)
            }}
          >
            <LocalizedLink href={getMyDashboardPath()} className="navbar-item">
              {t("nav.my_dashboard")}
            </LocalizedLink>
            <LocalizedLink href={getMyApplicationsPath()} className="navbar-item">
              {t("nav.my_applications")}
            </LocalizedLink>
            <LocalizedLink href={getMyAccountSettingsPath()} className="navbar-item">
              {t("nav.account_settings")}
            </LocalizedLink>
          </UserNav>
        </SiteHeader>
        <main id="main-content">{props.children}</main>
      </div>

      <SiteFooter>
        <FooterNav copyright={t("footer.city_county_of_sf")}>
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
