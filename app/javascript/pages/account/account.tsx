import React, { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { useAuth } from "@clerk/react"
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
  getMyAccountSettingsPath,
  getSignInPath,
} from "../../util/routeUtil"
import UserContext from "../../authentication/context/UserContext"
import { clearHeaders } from "../../authentication/token"
import { User } from "../../authentication/user"
import { withAuthentication } from "../../authentication/withAuthentication"
import { ConfigContext } from "../../lib/ConfigContext"

import ContactCard from "./components/ContactCard"
import SuccessToast from "./components/SuccessToast"
import { MyAccount } from "./my-account"
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
  isImage,
  getAssetPath,
}: {
  icon: string
  heading: string
  text: string
  buttonLabel: string
  isImage?: boolean
  getAssetPath?: (path: string) => string
}) => (
  <>
    {isImage && getAssetPath ? (
      <span className={styles.infoIcon}>
        <img
          src={getAssetPath(`${icon}.svg`)}
          alt=""
          style={{ width: "var(--seeds-s10)", height: "var(--seeds-s10)" }}
        />
      </span>
    ) : (
      <Icon className={styles.infoIcon} size="xlarge" symbol={icon as UniversalIconType} />
    )}
    <div className={styles.overviewContent}>
      <Heading priority={2} size="md" className={styles.overviewHeading}>
        {t(heading)}
      </Heading>
      <p className={styles.overviewText}>{t(text)}</p>
    </div>
    {/* Visual-only button to prevent nested <a> tags */}
    <span
      className={`seeds-button ${styles.overviewButton}`}
      data-variant="primary-outlined"
      data-size="sm"
    >
      {t(buttonLabel)}
    </span>
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
          {overviewSections.map(({ href, ...section }) => (
            <Tabs.Tab key={href} className={styles.overviewSection} href={href}>
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

const AccountReadyToast = () => {
  const { state } = useLocation() as { state?: { accountReady?: boolean } }
  const [toast, setToast] = useState(false)

  useEffect(() => {
    if (state?.accountReady) {
      setToast(true)
    }
  }, [state])

  if (!toast) return null

  return <SuccessToast>{t("createAccount.accountReady")}</SuccessToast>
}

interface AccountProps {
  assetPaths: unknown
}

const DeviseAccount = () => {
  const { signOut, profile } = useContext(UserContext)

  return (
    <Layout>
      <AccountReadyToast />
      <AccountLayout>
        <div className={styles.overview}>
          <AccountOverview signOut={() => signOut?.()} user={profile} />
        </div>
      </AccountLayout>
    </Layout>
  )
}

const ClerkAccount = () => {
  const { signOut } = useAuth()
  const { profile } = useContext(UserContext)
  const navigate = useNavigate()

  return (
    <Layout>
      <AccountReadyToast />
      <AccountLayout>
        <div className={styles.overview}>
          <AccountOverview
            signOut={() => {
              clearHeaders()
              void signOut().finally(() => {
                void navigate(getSignInPath())
              })
            }}
            user={profile}
          />
        </div>
      </AccountLayout>
    </Layout>
  )
}

const Account = ({ assetPaths }: AccountProps) => {
  const { unleashFlag: accountLayoutEnabled } = useFeatureFlag(UNLEASH_FLAG.ACCOUNTS_LAYOUT, false)
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  if (!accountLayoutEnabled) {
    return (
      <>
        <AccountReadyToast />
        <MyAccount assetPaths={assetPaths} />
      </>
    )
  }

  if (!flagsReady) {
    return null
  }

  return clerkEnabled ? <ClerkAccount /> : <DeviseAccount />
}

export default withAppSetup(withAuthentication(Account, { redirectType: RedirectType.Account }), {
  pageName: AppPages.Account,
})
