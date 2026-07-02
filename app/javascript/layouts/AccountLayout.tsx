import React from "react"
import AccountNav from "./AccountNav"
import { Breadcrumbs, BreadcrumbLink, t } from "@bloom-housing/ui-components"
import styles from "./AccountLayout.module.scss"
import { getPathWithoutLanguagePrefix } from "../util/languageUtil"
import { getMyAccountPath } from "../util/routeUtil"

export interface AccountLayoutProps {
  children: React.ReactNode
}

const ACCOUNT_BREADCRUMB_LABELS: Record<string, string> = {
  "/account/contact": "accountLayout.nav.contactInfo",
  "/account/applications": "accountLayout.nav.applications",
  "/account/settings": "accountSettings.title.sentenceCase",
}

const AccountLayout = ({ children }: AccountLayoutProps) => {
  const breadcrumb =
    ACCOUNT_BREADCRUMB_LABELS[getPathWithoutLanguagePrefix(window.location.pathname)]

  return (
    <div className={styles.accountLayoutBackground}>
      {breadcrumb && (
        <div className={styles.accountBreadcrumbs}>
          <Breadcrumbs>
            <BreadcrumbLink href={getMyAccountPath()}>
              {t("accountLayout.nav.overview")}
            </BreadcrumbLink>
            <BreadcrumbLink href="" current>
              {t(breadcrumb)}
            </BreadcrumbLink>
          </Breadcrumbs>
        </div>
      )}
      <div className={styles.accountLayout}>
        <AccountNav />
        <div className={styles.accountLayoutContent}>{children}</div>
      </div>
    </div>
  )
}

export default AccountLayout
