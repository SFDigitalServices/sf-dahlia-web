import React, { useContext } from "react"
import { t, Icon } from "@uic"
import { Heading, Tabs } from "@bloom-housing/ui-seeds"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ConfigContext } from "../lib/ConfigContext"
import { getPathWithoutLanguagePrefix } from "../util/languageUtil"
import {
  getMyAccountPath,
  getApplicationPath,
  getMyAccountSettingsPath,
  getSignInPath,
  getMyAccountContactPath,
} from "../util/routeUtil"
import styles from "./AccountNav.module.css"

const isNavActive = (localizedPath: string): boolean => {
  return (
    getPathWithoutLanguagePrefix(window.location.pathname) ===
    getPathWithoutLanguagePrefix(localizedPath)
  )
}

const AccountNav = () => {
  const { getAssetPath } = useContext(ConfigContext)

  return (
    <div className={styles.accountNav}>
      <Heading size="sm" className={styles.accountNavTitle}>
        {t("accountLayout.nav.title")}
      </Heading>
      <Tabs
        navigation
        navigationLabel={t("accountLayout.nav.title")}
        className={`vertical-sidebar-layout ${styles.accountNavTabs}`}
      >
        <Tabs.TabList>
          <Tabs.Tab href={getMyAccountPath()} active={isNavActive(getMyAccountPath())}>
            <Icon size="md-large" symbol="profile" className={styles.accountNavLinkIcon} />
            {t("accountLayout.nav.overview")}
          </Tabs.Tab>
          <Tabs.Tab
            href={getMyAccountContactPath()}
            active={isNavActive(getMyAccountContactPath())}
          >
            <img
              src={getAssetPath("contact-info.png")}
              alt=""
              className={`${styles.accountNavLinkIcon} ${styles.accountNavLinkImage}`}
            />
            {t("accountLayout.nav.contactInfo")}
          </Tabs.Tab>
          <Tabs.Tab href={getApplicationPath()} active={isNavActive(getApplicationPath())}>
            <Icon size="md-large" symbol="application" className={styles.accountNavLinkIcon} />
            {t("accountLayout.nav.applications")}
          </Tabs.Tab>
          <Tabs.Tab
            href={getMyAccountSettingsPath()}
            active={isNavActive(getMyAccountSettingsPath())}
          >
            <Icon size="md-large" symbol="settings" className={styles.accountNavLinkIcon} />
            {t("accountSettings.title.sentenceCase")}
          </Tabs.Tab>
          <Tabs.Tab href={getSignInPath()}>
            <FontAwesomeIcon
              size="lg"
              color="var(--seeds-color-gray-500)"
              icon={faArrowLeft}
              className={styles.accountNavLinkIcon}
            />
            {t("accountLayout.nav.signOut")}
          </Tabs.Tab>
        </Tabs.TabList>
      </Tabs>
    </div>
  )
}

export default AccountNav
