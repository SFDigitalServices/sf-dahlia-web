// New accounts layout for my-account.tsx
import React from "react"
import { Button, Heading, Tabs } from "@bloom-housing/ui-seeds"
import { Icon, t, UniversalIconType } from "@bloom-housing/ui-components"
import { faAngleRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import {
  AppPages,
  RedirectType,
  getMyAccountApplicationsPath,
  getMyAccountSettingsPath,
} from "../../util/routeUtil"
import UserContext from "../../authentication/context/UserContext"
import { User } from "../../authentication/user"
import { withAuthentication } from "../../authentication/withAuthentication"

import ContactCard from "./components/ContactCard"
import styles from "./account.module.scss"

const overviewSections = [
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
}: {
  icon: string
  heading: string
  text: string
  buttonLabel: string
  href: string
}) => (
  <>
    <Icon className={styles.infoIcon} size="xlarge" symbol={icon as UniversalIconType} />
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

const AccountOverview = ({
  signOut,
  hasButton,
  user,
}: {
  signOut: () => void
  hasButton: boolean
  user?: User
}) => (
  <>
    <ContactCard user={user} />
    <Tabs
      className="vertical-sidebar-layout"
      navigation={hasButton}
      navigationLabel={hasButton && t("accountLayout.nav.title")}
      onSelect={!hasButton && (() => false)}
    >
      <Tabs.TabList>
        {overviewSections.map((section) => (
          <Tabs.Tab
            key={section.href}
            className={styles.overviewSection}
            href={hasButton && section.href}
          >
            <OverviewSection {...section} />
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

const Account = () => {
  const { signOut, profile } = React.useContext(UserContext)
  return (
    <Layout>
      <AccountLayout>
        <div className={styles.overview}>
          <div className={styles.overviewOverLg}>
            <AccountOverview signOut={signOut} hasButton={true} user={profile} />
          </div>
          <div className={styles.overviewUnderLg}>
            <AccountOverview signOut={signOut} hasButton={false} user={profile} />
          </div>
        </div>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(withAuthentication(Account, { redirectType: RedirectType.Account }), {
  pageName: AppPages.Account,
})
