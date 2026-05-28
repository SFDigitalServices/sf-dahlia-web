import React from "react"
import { t, Icon } from "@bloom-housing/ui-components"
import { Heading, Tabs } from "@bloom-housing/ui-seeds"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { getPathWithoutLanguagePrefix } from "../util/languageUtil"
import {
  getAccountPath,
  getApplicationsPath,
  getSettingsPath,
  getSignInPath,
} from "../util/routeUtil"
import styles from "./AccountNav.module.scss"

const isNavActive = (navPath: string): boolean => {
  return getPathWithoutLanguagePrefix(window.location.pathname) === navPath
}

const AccountNav = () => {
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
          <Tabs.Tab href={getAccountPath()} active={isNavActive(getAccountPath())}>
            <Icon size="md-large" symbol="profile" className={styles.accountNavLinkIcon} />
            {t("accountLayout.nav.overview")}
          </Tabs.Tab>
          <Tabs.Tab href={getApplicationsPath()} active={isNavActive(getApplicationsPath())}>
            <Icon size="md-large" symbol="application" className={styles.accountNavLinkIcon} />
            {t("accountLayout.nav.applications")}
          </Tabs.Tab>
          <Tabs.Tab href={getSettingsPath()} active={isNavActive(getSettingsPath())}>
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
