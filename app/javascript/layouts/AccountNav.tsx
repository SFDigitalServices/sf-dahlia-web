import React, { useContext } from "react"
import { useAuth } from "@clerk/clerk-react"
import { t, Icon } from "@bloom-housing/ui-components"
import { Heading, Tabs } from "@bloom-housing/ui-seeds"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ConfigContext } from "../lib/ConfigContext"
import { getPathWithoutLanguagePrefix } from "../util/languageUtil"
import {
  getMyAccountPath,
  getMyAccountApplicationsPath,
  getMyAccountSettingsPath,
  getSignInPath,
  getMyAccountContactPath,
} from "../util/routeUtil"
import UserContext from "../authentication/context/UserContext"
import { clearHeaders } from "../authentication/token"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../modules/constants"
import styles from "./AccountNav.module.scss"

const isNavActive = (localizedPath: string): boolean => {
  return (
    getPathWithoutLanguagePrefix(window.location.pathname) ===
    getPathWithoutLanguagePrefix(localizedPath)
  )
}

const AccountNavLinks = ({ signOut }: { signOut: () => void | Promise<void> }) => {
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
              src={getAssetPath("contact-info.svg")}
              alt=""
              className={`${styles.accountNavLinkIcon} ${styles.accountNavLinkImage}`}
            />
            {t("accountLayout.nav.contactInfo")}
          </Tabs.Tab>
          <Tabs.Tab
            href={getMyAccountApplicationsPath()}
            active={isNavActive(getMyAccountApplicationsPath())}
          >
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
          <Tabs.Tab>
            <button
              type="button"
              className={styles.signOutButton}
              onClick={() => {
                void Promise.resolve(signOut()).finally(() => {
                  window.location.href = getSignInPath()
                })
              }}
            >
              <FontAwesomeIcon
                size="lg"
                color="var(--seeds-color-gray-500)"
                icon={faArrowLeft}
                className={styles.accountNavLinkIcon}
              />
              {t("accountLayout.nav.signOut")}
            </button>
          </Tabs.Tab>
        </Tabs.TabList>
      </Tabs>
    </div>
  )
}

const DeviseAccountNav = () => {
  const { signOut } = useContext(UserContext)
  return <AccountNavLinks signOut={() => signOut?.()} />
}

const ClerkAccountNav = () => {
  const { signOut } = useAuth()
  return (
    <AccountNavLinks
      signOut={async () => {
        clearHeaders()
        await signOut()
      }}
    />
  )
}

const AccountNav = () => {
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  if (!flagsReady) {
    return null
  }

  return clerkEnabled ? <ClerkAccountNav /> : <DeviseAccountNav />
}

export default AccountNav
