// New accounts layout for my-account.tsx
import React from "react"
import { Card, Button, Heading, Link } from "@bloom-housing/ui-seeds"
import { Icon, t } from "@bloom-housing/ui-components"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages, RedirectType, getApplicationsPath, getSettingsPath } from "../../util/routeUtil"
import UserContext from "../../authentication/context/UserContext"
import { withAuthentication } from "../../authentication/withAuthentication"
import styles from "./account.module.scss"

const Account = () => {
  const { signOut } = React.useContext(UserContext)
  return (
    <Layout>
      <AccountLayout>
        <Card className={styles.overview}>
          <Card.Section className={styles.overviewSection} divider="flush">
            <Icon className={styles.infoIcon} size="xlarge" symbol="application" />
            <Heading priority={2} size="md" className={styles.overviewHeading}>
              {t("accountLayout.nav.applications")}
            </Heading>
            <p className={styles.overviewText}>{t("accountLayout.account.p1")}</p>
            <Button
              className={styles.overviewButton}
              variant="primary-outlined"
              size="sm"
              href={getApplicationsPath()}
            >
              {t("accountLayout.account.seeApps")}
            </Button>
            <Link
              href={getApplicationsPath()}
              className={styles.overviewIcon}
              aria-label={t("accountLayout.account.seeApps")}
            >
              <Icon symbol="right" size="small" />
            </Link>
          </Card.Section>
          <Card.Section className={styles.overviewSection} divider="flush">
            <Icon className={styles.infoIcon} size="xlarge" symbol="settings" />
            <Heading priority={2} size="md" className={styles.overviewHeading}>
              {t("accountSettings.title.sentenceCase")}
            </Heading>
            <p className={styles.overviewText}>{t("accountLayout.account.p2")}</p>
            <Button
              className={styles.overviewButton}
              variant="primary-outlined"
              size="sm"
              href={getSettingsPath()}
            >
              {t("accountLayout.account.edit")}
            </Button>
            <Link
              href={getSettingsPath()}
              className={styles.overviewIcon}
              aria-label={t("accountLayout.account.edit")}
            >
              <Icon symbol="right" size="small" />
            </Link>
          </Card.Section>
          <Card.Section className={styles.overviewFooter} divider="flush">
            <Button variant="text" onClick={signOut} className={styles.signOut}>
              {t("accountLayout.account.signOut")}
            </Button>
          </Card.Section>
        </Card>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(withAuthentication(Account, { redirectType: RedirectType.Account }), {
  pageName: AppPages.MyAccount,
})
