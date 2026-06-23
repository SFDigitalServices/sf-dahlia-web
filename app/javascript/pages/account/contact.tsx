/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext } from "react"
import { Navigate } from "react-router"
import { t } from "@bloom-housing/ui-components"
import { Message, Link, Card, Heading } from "@bloom-housing/ui-seeds"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import {
  AppPages,
  getMyAccountPath,
  getMyAccountSettingsPath,
  RedirectType,
} from "../../util/routeUtil"
import { withAuthentication } from "../../authentication/withAuthentication"
import { ConfigContext } from "../../lib/ConfigContext"
import styles from "./contact.module.scss"
import UserContext from "../../authentication/context/UserContext"
import { renderInlineMarkup } from "../../util/languageUtil"

const Contact = () => {
  const { unleashFlag: accountLayoutEnabled } = useFeatureFlag(UNLEASH_FLAG.ACCOUNTS_LAYOUT, false)
  const { getAssetPath } = useContext(ConfigContext)
  const { profile } = useContext(UserContext)

  if (!accountLayoutEnabled) {
    return <Navigate to={getMyAccountPath()} replace />
  }

  return (
    <Layout>
      <AccountLayout>
        <Card className={styles.contactCard}>
          <Card.Header className={styles.header}>
            <div className={styles.iconBackground}>
              <img src={getAssetPath("contact-info.png")} alt="" className={styles.icon} />
            </div>
            <Heading priority={1} size="2xl" className={styles.heading}>
              {t("accountLayout.contact.title")}
            </Heading>
            {t("accountLayout.contact.subtitle")}
          </Card.Header>
          <Message>{t("accountLayout.contact.changeInfo")}</Message>
          <Card.Section divider="inset" className={styles.contactSection}>
            <Heading priority={2} size="md" className={styles.heading}>
              {t("label.emailAddress")}
            </Heading>
            <p className={styles.email}>{profile?.email}</p>
            <p className={styles.changeEmail}>
              {renderInlineMarkup(
                t("accountLayout.contact.changeEmail", { href: getMyAccountSettingsPath() })
              )}
            </p>
          </Card.Section>
          <Card.Section className={styles.contactSection}>Phone coming soon!</Card.Section>
          <Card.Footer className={styles.footer}>
            <Link href={getMyAccountPath()}>{t("accountLayout.contact.back")}</Link>
          </Card.Footer>
        </Card>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(withAuthentication(Contact, { redirectType: RedirectType.Account }), {
  pageName: AppPages.Contact,
})
