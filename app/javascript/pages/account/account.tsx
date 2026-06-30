import React, { useContext } from "react"
import { Button, Heading, Tabs } from "@bloom-housing/ui-seeds"
import { Icon, t, UniversalIconType } from "@bloom-housing/ui-components"
import { faAngleRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import {
  AppPages,
  RedirectType,
  getMyAccountApplicationsPath,
  getMyAccountContactPath,
  getMyAccountSettingsPath,
} from "../../util/routeUtil"
import UserContext from "../../authentication/context/UserContext"
import { User } from "../../authentication/user"
import { withAuthentication } from "../../authentication/withAuthentication"
import { ConfigContext } from "../../lib/ConfigContext"

import ContactCard from "./components/ContactCard"
import { MyAccount } from "./my-account"
import styles from "./account.module.scss"

const overviewSections = [
  {
    icon: "contact-info",
    heading: "accountLayout.nav.contactInfo",
    text: "accountLayout.account.p3",
    buttonLabel: "accountLayout.account.editContact",
    href: getMyAccountContactPath(),
    isImage: true,
  },
  {
    icon: "application",
    heading: "accountLayout.nav.applications",
    text: "accountLayout.account.p1",
    buttonLabel: "accountLayout.account.seeApps",
    href: getMyAccountApplicationsPath(),
  },
  {
    icon: "settings",
    heading: "accountSettings.title.sentenceCase",
    text: "accountLayout.account.p2",
    buttonLabel: "accountLayout.account.edit",
    href: getMyAccountSettingsPath(),
  },
]

const OverviewSection = ({
  icon,
  heading,
  text,
  buttonLabel,
  href,
  isImage,
  getAssetPath,
}: {
  icon: string
  heading: string
  text: string
  buttonLabel: string
  href: string
  isImage?: boolean
  getAssetPath?: (path: string) => string
}) => (
  <>
    {isImage && getAssetPath ? (
      <img
        src={getAssetPath(`${icon}.png`)}
        alt=""
        className={styles.infoIcon}
        style={{ width: "var(--seeds-s6)", height: "var(--seeds-s6)" }}
      />
    ) : (
      <Icon className={styles.infoIcon} size="xlarge" symbol={icon as UniversalIconType} />
    )}
    <div className={styles.overviewContent}>
      <Heading priority={2} size="md" className={styles.overviewHeading}>
        {t(heading)}
      </Heading>
      <p className={styles.overviewText}>{t(text)}</p>
    </div>
    <Button className={styles.overviewButton} variant="primary-outlined" size="sm" href={href}>
      {t(buttonLabel)}
    </Button>
    <span className={styles.overviewIcon} aria-hidden>
      <FontAwesomeIcon icon={faAngleRight} />
    </span>
  </>
)

const AccountOverview = ({ signOut, user }: { signOut: () => void; user?: User }) => {
  const { getAssetPath } = useContext(ConfigContext)

  return (
    <>
      <ContactCard user={user} />
      <Tabs
        className="vertical-sidebar-layout"
        navigation
        navigationLabel={t("accountLayout.nav.title")}
      >
        <Tabs.TabList>
          {overviewSections.map((section) => (
            <Tabs.Tab key={section.href} className={styles.overviewSection} href={section.href}>
              <OverviewSection {...section} getAssetPath={getAssetPath} />
            </Tabs.Tab>
          ))}
          <Tabs.Tab className={styles.overviewFooter}>
            <Button variant="text" onClick={signOut} className={styles.signOut}>
              {t("accountLayout.account.signOut")}
            </Button>
          </Tabs.Tab>
        </Tabs.TabList>
      </Tabs>
    </>
  )
}

interface AccountProps {
  assetPaths: unknown
}

const Account = ({ assetPaths }: AccountProps) => {
  const { unleashFlag: accountLayoutEnabled } = useFeatureFlag(UNLEASH_FLAG.ACCOUNTS_LAYOUT, false)
  const { signOut, profile } = React.useContext(UserContext)

  if (!accountLayoutEnabled) {
    return <MyAccount assetPaths={assetPaths} />
  }

  return (
    <Layout>
      <AccountLayout>
        <div className={styles.overview}>
          <AccountOverview signOut={signOut} user={profile} />
        </div>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(withAuthentication(Account, { redirectType: RedirectType.Account }), {
  pageName: AppPages.Account,
})
