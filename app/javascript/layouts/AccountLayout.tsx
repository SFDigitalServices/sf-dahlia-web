import React, { useContext } from "react"
import { t, Icon, Desktop } from "@bloom-housing/ui-components"
import { Heading, Button } from "@bloom-housing/ui-seeds"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import UserContext from "../authentication/context/UserContext"
import { getPathWithoutLanguagePrefix } from "../util/languageUtil"
import { getMyAccountPath, getApplicationPath, getMyAccountSettingsPath } from "../util/routeUtil"
import styles from "./AccountLayout.module.scss"

export const getNavStyle = (navPath?: string): string => {
  const path = getPathWithoutLanguagePrefix(window.location.pathname)
  if (path === navPath) return `${styles.accountNavLink} ${styles.accountNavActive}`
  return styles.accountNavLink
}

export interface AccountLayoutProps {
  children: React.ReactNode
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  const { signOut } = useContext(UserContext)
  return (
    <div className={styles.accountLayout}>
      <Desktop>
        <nav>
          <Heading size="sm" className={styles.accountNavTitle}>
            {t("accountLayout.nav.title")}
          </Heading>
          <div className={styles.accountNavTabList}>
            <Button
              className={getNavStyle("/account")}
              href={getMyAccountPath()}
              variant="text"
              leadIcon={
                <Icon size="md-large" symbol="profile" className={styles.accountNavLinkIcon} />
              }
            >
              {t("accountLayout.nav.overview")}
            </Button>
            <Button
              className={getNavStyle("/account/applications")}
              href={getApplicationPath()}
              variant="text"
              leadIcon={
                <Icon size="md-large" symbol="application" className={styles.accountNavLinkIcon} />
              }
            >
              {t("accountLayout.nav.applications")}
            </Button>
            <Button
              className={getNavStyle("/account/settings")}
              href={getMyAccountSettingsPath()}
              variant="text"
              leadIcon={
                <Icon size="md-large" symbol="settings" className={styles.accountNavLinkIcon} />
              }
            >
              {t("accountSettings.title.sentenceCase")}
            </Button>
            <Button
              className={getNavStyle()}
              onClick={signOut}
              variant="text"
              leadIcon={
                <FontAwesomeIcon
                  size="lg"
                  color="var(--seeds-color-gray-500)"
                  icon={faArrowLeft}
                  className={styles.accountNavLinkIcon}
                />
              }
            >
              {t("accountLayout.nav.signOut")}
            </Button>
          </div>
        </nav>
      </Desktop>
      {children}
    </div>
  )
}

export default AccountLayout
