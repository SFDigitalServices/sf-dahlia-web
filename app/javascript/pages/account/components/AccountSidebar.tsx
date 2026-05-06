import React, { useContext } from "react"
import { Icon, t, type UniversalIconType } from "@bloom-housing/ui-components"
import { getPathWithoutLanguagePrefix } from "../../../util/languageUtil"
import {
  getAccountDashboardPath,
  getAccountApplicationsPath,
  getAccountSettingsPath,
  getSignInPath,
} from "../../../util/routeUtil"
import UserContext from "../../../authentication/context/UserContext"

export const getActiveSection = (pathname: string): string => {
  const pathWithoutLang = getPathWithoutLanguagePrefix(pathname)
  if (pathWithoutLang.startsWith("/account/applications")) return "applications"
  if (pathWithoutLang.startsWith("/account/settings")) return "settings"
  return "overview"
}

const NAV_ITEMS: Array<{
  key: string
  labelKey: string
  pathGetter: () => string
  icon: UniversalIconType
  section: string
}> = [
  {
    key: "overview",
    labelKey: "accountDashboard.overview",
    pathGetter: getAccountDashboardPath,
    icon: "profile",
    section: "overview",
  },
  {
    key: "applications",
    labelKey: "accountDashboard.applicationAndLotteryResultsNav",
    pathGetter: getAccountApplicationsPath,
    icon: "application",
    section: "applications",
  },
  {
    key: "settings",
    labelKey: "accountSettings.title.sentenceCase",
    pathGetter: getAccountSettingsPath,
    icon: "settings",
    section: "settings",
  },
]

const AccountSidebar = () => {
  const { signOut } = useContext(UserContext)
  const activeSection = getActiveSection(window.location.pathname)

  const handleSignOut = () => {
    if (signOut) {
      signOut()
    }
    window.location.href = getSignInPath()
  }

  return (
    <nav aria-label={t("nav.accountNavigation")} className="account-sidebar">
      <h2 className="account-sidebar__heading">{t("nav.account")}</h2>
      <ul className="account-sidebar__list">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.section
          return (
            <li key={item.key}>
              <a
                href={item.pathGetter()}
                aria-current={isActive ? "page" : undefined}
                className={`account-sidebar__link ${
                  isActive ? "account-sidebar__link--active" : ""
                }`}
              >
                <Icon size="medium" symbol={item.icon} />
                <span>{t(item.labelKey)}</span>
              </a>
            </li>
          )
        })}
        <li>
          <button
            type="button"
            onClick={handleSignOut}
            className="account-sidebar__link account-sidebar__signout"
          >
            <Icon size="medium" symbol="arrowBack" />
            <span>{t("accountDashboard.signOut")}</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default AccountSidebar
